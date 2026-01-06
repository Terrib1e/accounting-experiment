package com.accounting.platform.journal.repository;

import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.entity.JournalEntryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    Page<JournalEntry> findByEntryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<JournalEntry> findByStatus(JournalEntryStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0) FROM JournalEntry j JOIN j.lines l JOIN l.account a WHERE a.subtype IN ('BANK', 'CASH') AND j.status = 'POSTED'")
    java.math.BigDecimal getNetCashBalance();

}
