package com.accounting.platform.account.service;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.repository.AccountRepository;
import com.accounting.platform.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AuditService auditService;
    private final com.accounting.platform.account.mapper.AccountMapper accountMapper;

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<com.accounting.platform.account.dto.AccountHierarchyDto> getAccountHierarchy() {
        List<Account> allAccounts = accountRepository.findAll();
        // Filter root accounts (parentAccountId is null)
        return allAccounts.stream()
                .filter(account -> account.getParentAccountId() == null)
                .map(account -> buildHierarchy(account, allAccounts))
                .toList();
    }

    private com.accounting.platform.account.dto.AccountHierarchyDto buildHierarchy(Account parent, List<Account> allAccounts) {
        com.accounting.platform.account.dto.AccountHierarchyDto dto = accountMapper.toHierarchyDto(parent);
        List<com.accounting.platform.account.dto.AccountHierarchyDto> children = allAccounts.stream()
                .filter(a -> parent.getId().equals(a.getParentAccountId()))
                .map(a -> buildHierarchy(a, allAccounts))
                .toList();
        dto.setChildren(children);
        return dto;
    }

    public Optional<Account> getAccountById(UUID id) {
        return accountRepository.findById(id);
    }

    @Transactional
    public Account createAccount(Account account) {
        if (accountRepository.existsByCode(account.getCode())) {
            throw new IllegalArgumentException("Account with code " + account.getCode() + " already exists");
        }

        if (account.getParentAccountId() != null) {
            if (!accountRepository.existsById(account.getParentAccountId())) {
                throw new IllegalArgumentException("Parent account not found");
            }
            // Basic circular dependency check (self-parenting)
            if (account.getParentAccountId().equals(account.getId())) {
                 throw new IllegalArgumentException("Account cannot be its own parent");
            }
        }

        Account savedAccount = accountRepository.save(account);
        auditService.logCreate("Account", savedAccount.getId(), savedAccount);
        return savedAccount;
    }

    @Transactional
    public Account updateAccount(UUID id, Account accountDetails) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getCode().equals(accountDetails.getCode()) && accountRepository.existsByCode(accountDetails.getCode())) {
             throw new IllegalArgumentException("Account code " + accountDetails.getCode() + " already exists");
        }

        // Circular dependency check for updates
        if (accountDetails.getParentAccountId() != null) {
            if (accountDetails.getParentAccountId().equals(id)) {
                throw new IllegalArgumentException("Account cannot be its own parent");
            }
            // In a real app, we would traverse up the tree to ensure no cycles
        }

        // Capture old state for audit
        // We'd ideally clone the object or have a DTO map here

        account.setCode(accountDetails.getCode());
        account.setName(accountDetails.getName());
        account.setDescription(accountDetails.getDescription());
        account.setType(accountDetails.getType());
        account.setSubtype(accountDetails.getSubtype());
        account.setParentAccountId(accountDetails.getParentAccountId());
        account.setActive(accountDetails.isActive());
        // Currency usually shouldn't change if tx exist, but simple update for now

        Account updatedAccount = accountRepository.save(account);
        auditService.logUpdate("Account", updatedAccount.getId(), null, updatedAccount);
        return updatedAccount;
    }

    @Transactional
    public void deleteAccount(UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        // Check for children
        List<Account> children = accountRepository.findByParentAccountId(id);
        if (!children.isEmpty()) {
            throw new IllegalStateException("Cannot delete account with child accounts");
        }

        // TODO: Check for existing transactions/journal entries

        accountRepository.delete(account);
        auditService.logDelete("Account", id, account);
    }
}
