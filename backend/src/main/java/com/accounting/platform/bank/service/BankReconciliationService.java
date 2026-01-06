package com.accounting.platform.bank.service;

import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.bank.entity.BankAccount;
import com.accounting.platform.bank.entity.BankTransaction;
import com.accounting.platform.bank.entity.BankTransactionStatus;
import com.accounting.platform.bank.repository.BankAccountRepository;
import com.accounting.platform.bank.repository.BankTransactionRepository;
import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.entity.JournalEntryLine;
import com.accounting.platform.journal.repository.JournalEntryRepository;
import com.accounting.platform.journal.service.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankReconciliationService {

    private final BankAccountRepository bankAccountRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryService journalEntryService; // Reuse existing services
    private final AuditService auditService;

    public static class ReconciliationSuggestion {
        public BankTransaction bankTransaction;
        public List<JournalEntry> possibleMatches;
    }

    public List<ReconciliationSuggestion> getSuggestions(UUID bankAccountId) {
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Bank Account not found"));

        // 1. Get Unreconciled Bank Transactions
        List<BankTransaction> unreconciled = bankTransactionRepository.findByBankAccountAndStatus(
                bankAccount, BankTransactionStatus.IMPORTED, null // No paging
        ).getContent(); // assuming small volume for demo

        List<ReconciliationSuggestion> suggestions = new ArrayList<>();

        // 2. For each, find matching Journal Entries touching the GL Account
        for (BankTransaction tx : unreconciled) {
            // Find entries with same Amount (+/- 0.01) within +/- 3 days
            // This is "soft" matching.
            // Complex query usually required. Here we do rudimentary in-memory filter for demo.
            // Ideally: Repository Custom Query

            // Getting ALL entries for period is too heavy. Let's assume we fetch a reasonable window.
            LocalDate start = tx.getDate().minusDays(5);
            LocalDate end = tx.getDate().plusDays(5);

            // We need a repository method that joins JournalEntry and Line
            // For now, let's assume we rely on iterating recent entries from repository
            // optimizing this requires a custom Repostiory query: findEntriesByAccountAndDateAndAmount

            // Placeholder logic:
            ReconciliationSuggestion suggestion = new ReconciliationSuggestion();
            suggestion.bankTransaction = tx;
            suggestion.possibleMatches = new ArrayList<>(); // TODO: Implement actual lookup
            suggestions.add(suggestion);
        }

        return suggestions;
    }

    @Transactional
    public void reconcileTransaction(UUID bankTransactionId, UUID journalEntryId) {
        BankTransaction tx = bankTransactionRepository.findById(bankTransactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (tx.getStatus() != BankTransactionStatus.IMPORTED) {
            throw new IllegalStateException("Transaction already reconciled or matched");
        }

        JournalEntry entry = journalEntryService.getEntryById(journalEntryId);

        // Validate amounts match (conceptually).
        // Check if journal entry actually affects the bank's GL account
        // ...

        tx.setStatus(BankTransactionStatus.RECONCILED);
        tx.setMatchedJournalEntryId(entry.getId());
        bankTransactionRepository.save(tx);

        auditService.logAction("RECONCILE_TRANSACTION", "BankTransaction", tx.getId(), "Matched with JE " + entry.getReferenceNumber());
    }
}
