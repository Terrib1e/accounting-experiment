package com.accounting.platform.account.repository;

import com.accounting.platform.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByCode(String code);

    boolean existsByCode(String code);

    List<Account> findByParentAccountId(UUID parentAccountId);
}
