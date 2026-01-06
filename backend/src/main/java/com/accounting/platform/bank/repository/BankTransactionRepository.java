package com.accounting.platform.bank.repository;

import com.accounting.platform.bank.entity.BankAccount;
import com.accounting.platform.bank.entity.BankTransaction;
import com.accounting.platform.bank.entity.BankTransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, UUID> {
    Page<BankTransaction> findByBankAccountAndStatus(BankAccount bankAccount, BankTransactionStatus status, Pageable pageable);

    List<BankTransaction> findByBankAccountAndStatusAndDateBetween(
            BankAccount bankAccount,
            BankTransactionStatus status,
            LocalDate startDate,
            LocalDate endDate
    );
}
