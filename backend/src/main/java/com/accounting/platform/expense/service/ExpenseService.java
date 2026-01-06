package com.accounting.platform.expense.service;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.entity.AccountSubtype;
import com.accounting.platform.account.repository.AccountRepository;
import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.entity.ExpenseLine;
import com.accounting.platform.expense.entity.ExpenseStatus;
import com.accounting.platform.expense.repository.ExpenseRepository;
import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.entity.JournalEntryLine;
import com.accounting.platform.journal.service.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final JournalEntryService journalEntryService;
    private final AccountRepository accountRepository;
    private final ContactRepository contactRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<Expense> getAllExpenses(Pageable pageable) {
        Page<Expense> expenses = expenseRepository.findAll(pageable);
        expenses.forEach(expense -> expense.getLines().size()); // Initialize lazy collection
        return expenses;
    }

    @Transactional(readOnly = true)
    public Expense getExpenseById(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        expense.getLines().size(); // Initialize lazy collection
        return expense;
    }

    @Transactional
    public Expense createExpense(Expense expense) {
        if (expense.getStatus() == null) {
            expense.setStatus(ExpenseStatus.DRAFT);
        }

        // Fetch vendor from database to avoid detached entity issues
        if (expense.getVendor() != null && expense.getVendor().getId() != null) {
            Contact vendor = contactRepository.findById(expense.getVendor().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
            expense.setVendor(vendor);
        } else {
            throw new IllegalArgumentException("Vendor is required");
        }

        if (expense.getLines() != null) {
            expense.getLines().forEach(line -> {
                line.setExpense(expense);
                // Fetch the account from the database to avoid detached entity issues
                if (line.getExpenseAccount() != null && line.getExpenseAccount().getId() != null) {
                    Account managedAccount = accountRepository.findById(line.getExpenseAccount().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + line.getExpenseAccount().getId()));
                    line.setExpenseAccount(managedAccount);
                }
            });
            expense.calculateTotal();
        }

        Expense saved = expenseRepository.save(expense);
        auditService.logCreate("Expense", saved.getId(), saved);
        return saved;
    }

    @Transactional
    public Expense updateExpense(UUID id, Expense expenseDetails) {
        Expense expense = getExpenseById(id);

        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new IllegalStateException("Cannot update expense that is not in DRAFT status");
        }

        expense.setDate(expenseDetails.getDate());
        expense.setDueDate(expenseDetails.getDueDate());
        expense.setReferenceNumber(expenseDetails.getReferenceNumber());
        expense.setNotes(expenseDetails.getNotes());

        expense.getLines().clear();
        if (expenseDetails.getLines() != null) {
            expenseDetails.getLines().forEach(line -> {
                // Fetch the account from the database to avoid detached entity issues
                if (line.getExpenseAccount() != null && line.getExpenseAccount().getId() != null) {
                    Account managedAccount = accountRepository.findById(line.getExpenseAccount().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + line.getExpenseAccount().getId()));
                    line.setExpenseAccount(managedAccount);
                }
                expense.addLine(line);
            });
        }
        expense.calculateTotal();

        Expense updated = expenseRepository.save(expense);
        auditService.logUpdate("Expense", updated.getId(), null, updated);
        return updated;
    }

    @Transactional
    public Expense approveExpense(UUID id) {
        Expense expense = getExpenseById(id);

        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new IllegalStateException("Expense is already approved or voided");
        }

        if (expense.getLines().isEmpty()) {
            throw new IllegalStateException("Expense must have at least one line item");
        }

        // 1. Find Accounts Payable Account
        Account apAccount = accountRepository.findAll().stream()
                .filter(a -> a.getSubtype() == AccountSubtype.ACCOUNTS_PAYABLE && a.isActive())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active Accounts Payable account found"));

        // 2. Create Journal Entry
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(expense.getDate());
        entry.setDescription("Bill #" + expense.getReferenceNumber() + " from " + expense.getVendor().getName());
        entry.setReferenceNumber(expense.getReferenceNumber());

        // Credit AP (Total Amount)
        JournalEntryLine creditLine = new JournalEntryLine();
        creditLine.setAccount(apAccount);
        creditLine.setCredit(expense.getTotalAmount());
        creditLine.setDescription("Bill " + expense.getReferenceNumber());
        entry.addLine(creditLine);

        // Debit Expense Account (Per Line)
        for (ExpenseLine line : expense.getLines()) {
            JournalEntryLine debitLine = new JournalEntryLine();
            debitLine.setAccount(line.getExpenseAccount());
            debitLine.setDebit(line.getAmount());
            debitLine.setDescription(line.getDescription());
            entry.addLine(debitLine);
        }

        JournalEntry createdEntry = journalEntryService.createEntry(entry);
        journalEntryService.postEntry(createdEntry.getId());

        // 3. Update Expense Status
        expense.setStatus(ExpenseStatus.APPROVED);
        Expense saved = expenseRepository.save(expense);

        auditService.logAction("APPROVE_EXPENSE", "Expense", id, "Created Journal Entry " + createdEntry.getReferenceNumber());

        return saved;
    }
    @Transactional
    public Expense payExpense(UUID id, com.accounting.platform.expense.dto.ExpensePaymentRequestDto request) {
        Expense expense = getExpenseById(id);

        if (expense.getStatus() != ExpenseStatus.APPROVED && expense.getStatus() != ExpenseStatus.PAID) {
            if(expense.getStatus() == ExpenseStatus.PAID) {
                throw new IllegalStateException("Expense is already paid");
            }
            throw new IllegalStateException("Expense must be APPROVED before payment");
        }

        Account bankAccount = accountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Bank Account not found"));

        if (bankAccount.getSubtype() != AccountSubtype.BANK && bankAccount.getSubtype() != AccountSubtype.CASH) {
            throw new IllegalArgumentException("Selected account is not a Bank or Cash account");
        }

        // Find Accounts Payable Account (assume same as approval)
        Account apAccount = accountRepository.findAll().stream()
                .filter(a -> a.getSubtype() == AccountSubtype.ACCOUNTS_PAYABLE && a.isActive())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active Accounts Payable account found"));

        // Create Journal Entry
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(request.getPaymentDate());
        entry.setDescription("Payment for Bill #" + expense.getReferenceNumber());
        entry.setReferenceNumber("PAY-" + expense.getReferenceNumber());

        // Debit Accounts Payable (Liability Decreases)
        JournalEntryLine debitAP = new JournalEntryLine();
        debitAP.setAccount(apAccount);
        debitAP.setDebit(expense.getTotalAmount());
        debitAP.setDescription("Bill #" + expense.getReferenceNumber() + " Payment");
        entry.addLine(debitAP);

        // Credit Bank (Asset Decreases)
        JournalEntryLine creditBank = new JournalEntryLine();
        creditBank.setAccount(bankAccount);
        creditBank.setCredit(expense.getTotalAmount());
        creditBank.setDescription("Payment Sent");
        entry.addLine(creditBank);

        JournalEntry createdEntry = journalEntryService.createEntry(entry);
        journalEntryService.postEntry(createdEntry.getId());

        // Update Expense
        expense.setStatus(ExpenseStatus.PAID);
        Expense saved = expenseRepository.save(expense);

        auditService.logAction("PAY_EXPENSE", "Expense", id, "Registered Payment " + createdEntry.getReferenceNumber());

        return saved;
    }
    @Transactional
    public void deleteExpense(UUID id) {
        Expense expense = getExpenseById(id);
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT expenses can be deleted");
        }
        expenseRepository.delete(expense);
        auditService.logAction("DELETE_EXPENSE", "Expense", id, null);
    }
}
