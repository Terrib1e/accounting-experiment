package com.accounting.platform.journal.service;

import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.entity.JournalEntryLine;
import com.accounting.platform.journal.entity.JournalEntryStatus;
import com.accounting.platform.journal.repository.JournalEntryRepository;
import com.accounting.platform.journal.dto.JournalEntryDto;
import com.accounting.platform.journal.mapper.JournalEntryMapper;
import java.time.LocalDate;
import com.accounting.platform.settings.service.FiscalPeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;
    private final FiscalPeriodService fiscalPeriodService;
    private final AuditService auditService;
    private final JournalEntryMapper journalEntryMapper;

    @Transactional(readOnly = true)
    public Page<JournalEntryDto> getAllEntryDtos(Pageable pageable) {
        return journalEntryRepository.findAll(pageable)
                .map(journalEntryMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<JournalEntry> getAllEntries(Pageable pageable) {
        return journalEntryRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<JournalEntry> getEntriesByStatus(JournalEntryStatus status, Pageable pageable) {
        return journalEntryRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public JournalEntry getEntryById(UUID id) {
        return journalEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Journal entry not found"));
    }

    @Transactional
    public JournalEntry createEntry(JournalEntry entry) {
        if (entry.getStatus() == null) {
            entry.setStatus(JournalEntryStatus.DRAFT);
        }

        if (entry.getLines() != null) {
            entry.getLines().forEach(line -> line.setJournalEntry(entry));
        }

        JournalEntry saved = journalEntryRepository.save(entry);
        auditService.logCreate("JournalEntry", saved.getId(), saved);
        return saved;
    }

    @Transactional
    public JournalEntry updateEntry(UUID id, JournalEntry entryDetails) {
        JournalEntry entry = getEntryById(id);

        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new IllegalStateException("Cannot update entry that is not in DRAFT status");
        }

        entry.setEntryDate(entryDetails.getEntryDate());
        entry.setDescription(entryDetails.getDescription());
        entry.setReferenceNumber(entryDetails.getReferenceNumber());

        entry.getLines().clear();
        if (entryDetails.getLines() != null) {
            entryDetails.getLines().forEach(entry::addLine);
        }

        JournalEntry updated = journalEntryRepository.save(entry);
        auditService.logUpdate("JournalEntry", updated.getId(), null, updated);
        return updated;
    }

    @Transactional
    public JournalEntry approve(UUID id) {
        JournalEntry entry = getEntryById(id);
        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT entries can be approved");
        }
        entry.setStatus(JournalEntryStatus.APPROVED);
        auditService.logAction("APPROVE_JOURNAL_ENTRY", "JournalEntry", id, null);
        return journalEntryRepository.save(entry);
    }

    @Transactional
    public JournalEntry postEntry(UUID id) {
        JournalEntry entry = getEntryById(id);

        if (entry.getStatus() != JournalEntryStatus.APPROVED) {
             throw new IllegalStateException("Entry must be APPROVED before posting");
        }

        if (!fiscalPeriodService.isDateInOpenPeriod(entry.getEntryDate())) {
            throw new IllegalStateException("Entry date " + entry.getEntryDate() + " is not in an open fiscal period");
        }

        // Validate each line has either debit OR credit, but not both and not neither
        entry.getLines().forEach(line -> {
            boolean hasDebit = line.getDebit().compareTo(BigDecimal.ZERO) > 0;
            boolean hasCredit = line.getCredit().compareTo(BigDecimal.ZERO) > 0;
            if (hasDebit && hasCredit) {
                throw new IllegalStateException("Line for account " + line.getAccount().getCode() + " cannot have both debit and credit values");
            }
            if (!hasDebit && !hasCredit) {
                throw new IllegalStateException("Line for account " + line.getAccount().getCode() + " must have either a debit or credit value");
            }
        });

        BigDecimal totalDebit = entry.getLines().stream()
                .map(JournalEntryLine::getDebit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredit = entry.getLines().stream()
                .map(JournalEntryLine::getCredit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalStateException("Entry is not balanced. Debits: " + totalDebit + ", Credits: " + totalCredit);
        }

        entry.setStatus(JournalEntryStatus.POSTED);
        JournalEntry saved = journalEntryRepository.save(entry);
        auditService.logAction("POST_JOURNAL_ENTRY", "JournalEntry", id, null);
        return saved;
    }

    @Transactional
    public JournalEntry voidEntry(UUID id) {
        JournalEntry entry = getEntryById(id);
        if (entry.getStatus() == JournalEntryStatus.VOID) {
            return entry;
        }
        if (entry.getStatus() == JournalEntryStatus.POSTED) {
            throw new IllegalStateException("Cannot void POSTED entry. Use reverse instead.");
        }
        entry.setStatus(JournalEntryStatus.VOID);
        auditService.logAction("VOID_JOURNAL_ENTRY", "JournalEntry", id, null);
        return journalEntryRepository.save(entry);
    }

    @Transactional
    public JournalEntry reverse(UUID id) {
        JournalEntry original = getEntryById(id);
        if (original.getStatus() != JournalEntryStatus.POSTED) {
            throw new IllegalStateException("Only POSTED entries can be reversed");
        }

        JournalEntry reversal = new JournalEntry();
        reversal.setEntryDate(LocalDate.now()); // Or original date? Usually current date.
        reversal.setDescription("Reversal of " + original.getReferenceNumber());
        reversal.setReferenceNumber("REV-" + original.getReferenceNumber());
        reversal.setStatus(JournalEntryStatus.DRAFT);

        original.getLines().forEach(line -> {
            JournalEntryLine newLine = new JournalEntryLine();
            newLine.setAccount(line.getAccount());
            // Swap debit/credit
            newLine.setDebit(line.getCredit());
            newLine.setCredit(line.getDebit());
            newLine.setDescription(line.getDescription());
            reversal.addLine(newLine);
        });

        JournalEntry savedReversal = createEntry(reversal);
        auditService.logAction("REVERSE_JOURNAL_ENTRY", "JournalEntry", original.getId(), "Created reversal: " + savedReversal.getId());
        return savedReversal;
    }
    @Transactional
    public void deleteJournalEntry(UUID id) {
        JournalEntry entry = getEntryById(id);
        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT entries can be deleted");
        }
        journalEntryRepository.delete(entry);
        auditService.logAction("DELETE_JOURNAL_ENTRY", "JournalEntry", id, null);
    }

    @Transactional(readOnly = true)
    public JournalEntryDto getEntryDtoById(UUID id) {
        return journalEntryMapper.toDto(getEntryById(id));
    }

    @Transactional
    public JournalEntryDto createEntryDto(JournalEntryDto dto) {
        JournalEntry entry = journalEntryMapper.toEntity(dto);
        return journalEntryMapper.toDto(createEntry(entry));
    }

    @Transactional
    public JournalEntryDto updateEntryDto(UUID id, JournalEntryDto dto) {
        JournalEntry entry = journalEntryMapper.toEntity(dto);
        return journalEntryMapper.toDto(updateEntry(id, entry));
    }

    @Transactional
    public JournalEntryDto approveEntryDto(UUID id) {
        return journalEntryMapper.toDto(approve(id));
    }

    @Transactional
    public JournalEntryDto postEntryDto(UUID id) {
        return journalEntryMapper.toDto(postEntry(id));
    }

    @Transactional
    public JournalEntryDto voidEntryDto(UUID id) {
        return journalEntryMapper.toDto(voidEntry(id));
    }

    @Transactional
    public JournalEntryDto reverseEntryDto(UUID id) {
        return journalEntryMapper.toDto(reverse(id));
    }
}
