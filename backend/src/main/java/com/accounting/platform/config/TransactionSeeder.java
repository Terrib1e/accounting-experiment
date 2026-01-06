package com.accounting.platform.config;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.entity.AccountSubtype;
import com.accounting.platform.account.repository.AccountRepository;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.expense.dto.ExpensePaymentRequestDto;
import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.entity.ExpenseLine;
import com.accounting.platform.expense.repository.ExpenseRepository;
import com.accounting.platform.expense.service.ExpenseService;
import com.accounting.platform.invoice.dto.PaymentRequestDto;
import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.entity.InvoiceLine;
import com.accounting.platform.invoice.repository.InvoiceRepository;
import com.accounting.platform.invoice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class TransactionSeeder {

    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseService expenseService;
    private final ExpenseRepository expenseRepository;
    private final ContactRepository contactRepository;
    private final AccountRepository accountRepository;

    @Bean
    @Order(3) // Run after ClientUserSeeder
    public CommandLineRunner seedTransactions() {
        return args -> {
            if (invoiceRepository.count() > 0 && expenseRepository.count() > 0) {
                log.info("Transactions already seeded");
                return;
            }

            log.info("Seeding Transaction Data...");

            Contact client1 = contactRepository.findByEmail("john@acme.com").orElseThrow();
            Contact client2 = contactRepository.findByEmail("tony@stark.com").orElse(null);
            if (client2 == null) {
                 // Create if missing (WorkflowSeeder might not run if data exists)
                 // For safety sake, just use client1 if client2 missing or skip
            }

            Account revenueAccount = accountRepository.findByCode("4000").orElseThrow(); // Sales Income
            Account expenseAccount = accountRepository.findByCode("6060").orElseThrow(); // Rent
            Account bankAccount = accountRepository.findByCode("1010").orElseThrow(); // Checking

            // 1. Create Paid Invoices (Revenue)
            createPaidInvoice(client1, revenueAccount, bankAccount, "Web Development Services", new BigDecimal("5000.00"), LocalDate.now().minusDays(10));
            createPaidInvoice(client1, revenueAccount, bankAccount, "Q1 Hosting", new BigDecimal("1200.00"), LocalDate.now().minusDays(5));
            createPaidInvoice(client1, revenueAccount, bankAccount, "Consulting Hours", new BigDecimal("3500.00"), LocalDate.now().minusDays(20));

            // 2. Create Sent Invoices (Outstanding)
            createSentInvoice(client1, revenueAccount, "Q2 Retainer", new BigDecimal("2500.00"), LocalDate.now());
            createSentInvoice(client1, revenueAccount, "Emergency Fix", new BigDecimal("850.00"), LocalDate.now().minusDays(1));

            // 3. Create Expenses
            // Use client1 as vendor for simplicity if vendor specific contacts aren't separate in this simple seed logic
            // Ideally we'd have a Vendor contact. Let's create one on the fly if needed or reuse.
            Contact vendor = contactRepository.save(createVendorContact("Landlord LLC", "rent@landlord.com"));

            createPaidExpense(vendor, expenseAccount, bankAccount, "Office Rent - Jan", new BigDecimal("2000.00"), LocalDate.now().minusDays(15));
            createPaidExpense(vendor, expenseAccount, bankAccount, "Office Rent - Feb", new BigDecimal("2000.00"), LocalDate.now().minusDays(1));

            Account officeSupplies = accountRepository.findByCode("6050").orElseThrow();
            Contact staplerVendor = contactRepository.save(createVendorContact("Staples", "sales@staples.com"));
            createApprovedExpense(staplerVendor, officeSupplies, "Bulk Paper & Inks", new BigDecimal("450.25"), LocalDate.now());

            log.info("Transaction Data Seeded Successfully");
        };
    }

    private Contact createVendorContact(String name, String email) {
        return contactRepository.findByEmail(email).orElseGet(() -> {
            Contact c = new Contact();
            c.setName(name);
            c.setEmail(email);
            c.setType(com.accounting.platform.contact.entity.ContactType.VENDOR);
            c.setTaxId("00-0000000");
            return c; // We will save in valid context or rely on repository.save call above
        });
    }

    private void createPaidInvoice(Contact contact, Account revenueAccount, Account bankAccount, String desc, BigDecimal amount, LocalDate date) {
        Invoice invoice = new Invoice();
        invoice.setContact(contact);
        invoice.setIssueDate(date);
        invoice.setDueDate(date.plusDays(30));
        invoice.setCurrency("USD");

        InvoiceLine line = new InvoiceLine();
        line.setDescription(desc);
        // line.setAmount(amount); // Removed as amount is derived from quantity * unitPrice
        line.setQuantity(BigDecimal.ONE);
        line.setUnitPrice(amount);
        line.setRevenueAccount(revenueAccount);

        invoice.addLine(line);

        Invoice saved = invoiceService.createInvoice(invoice);
        invoiceService.approveInvoice(saved.getId());

        PaymentRequestDto payment = new PaymentRequestDto();
        payment.setBankAccountId(bankAccount.getId());
        payment.setPaymentDate(date);
        // payment.setAmount(amount); // Derives from invoice total
        invoiceService.payInvoice(saved.getId(), payment);
    }

    private void createSentInvoice(Contact contact, Account revenueAccount, String desc, BigDecimal amount, LocalDate date) {
        Invoice invoice = new Invoice();
        invoice.setContact(contact);
        invoice.setIssueDate(date);
        invoice.setDueDate(date.plusDays(30));
        invoice.setCurrency("USD");

        InvoiceLine line = new InvoiceLine();
        line.setDescription(desc);
        // line.setAmount(amount); // Removed as amount is derived from quantity * unitPrice
        line.setQuantity(BigDecimal.ONE);
        line.setUnitPrice(amount);
        line.setRevenueAccount(revenueAccount);

        invoice.addLine(line);

        Invoice saved = invoiceService.createInvoice(invoice);
        invoiceService.approveInvoice(saved.getId());
    }

    private void createPaidExpense(Contact vendor, Account expenseAccount, Account bankAccount, String desc, BigDecimal amount, LocalDate date) {
        Expense expense = new Expense();
        expense.setVendor(vendor);
        expense.setDate(date);
        expense.setDueDate(date.plusDays(15));
        expense.setReferenceNumber("EXP-" + System.nanoTime()); // safe unique
        expense.setCurrency("USD");

        ExpenseLine line = new ExpenseLine();
        line.setDescription(desc);
        line.setAmount(amount);
        line.setExpenseAccount(expenseAccount);

        expense.addLine(line);

        Expense saved = expenseService.createExpense(expense);
        expenseService.approveExpense(saved.getId());

        ExpensePaymentRequestDto payment = new ExpensePaymentRequestDto();
        payment.setBankAccountId(bankAccount.getId());
        payment.setPaymentDate(date);
        expenseService.payExpense(saved.getId(), payment);
    }

    private void createApprovedExpense(Contact vendor, Account expenseAccount, String desc, BigDecimal amount, LocalDate date) {
        Expense expense = new Expense();
        expense.setVendor(vendor);
        expense.setDate(date);
        expense.setDueDate(date.plusDays(15));
        expense.setReferenceNumber("EXP-" + System.nanoTime());
        expense.setCurrency("USD");

        ExpenseLine line = new ExpenseLine();
        line.setDescription(desc);
        line.setAmount(amount);
        line.setExpenseAccount(expenseAccount);

        expense.addLine(line);

        Expense saved = expenseService.createExpense(expense);
        expenseService.approveExpense(saved.getId());
    }
}
