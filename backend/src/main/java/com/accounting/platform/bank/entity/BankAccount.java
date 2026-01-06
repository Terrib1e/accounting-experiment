package com.accounting.platform.bank.entity;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "bank_accounts")
public class BankAccount extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "account_number", nullable = false)
    private String accountNumber; // TODO: Encrypt

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String currency;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gl_account_id", nullable = false, unique = true)
    private Account glAccount;

    @Column(name = "last_reconciled_date")
    private LocalDate lastReconciledDate;

    @Column(name = "last_reconciled_balance", precision = 19, scale = 4)
    private BigDecimal lastReconciledBalance;
}
