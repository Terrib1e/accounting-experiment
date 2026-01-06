package com.accounting.platform.bank.repository;

import com.accounting.platform.bank.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, UUID> {
    boolean existsByGlAccountId(UUID glAccountId);
}
