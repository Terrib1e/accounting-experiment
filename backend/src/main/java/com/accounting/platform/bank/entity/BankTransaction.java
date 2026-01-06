package com.accounting.platform.bank.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "bank_transactions", indexes = {
    @Index(name = "idx_bank_tx_date", columnList = "date"),
    @Index(name = "idx_bank_tx_status", columnList = "status")
})
public class BankTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false)
    private String description;

    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BankTransactionStatus status = BankTransactionStatus.IMPORTED;

    @Column(name = "matched_journal_entry_id")
    private UUID matchedJournalEntryId;
}
