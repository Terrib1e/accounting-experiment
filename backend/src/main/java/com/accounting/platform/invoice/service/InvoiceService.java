package com.accounting.platform.invoice.service;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.entity.AccountSubtype;
import com.accounting.platform.account.repository.AccountRepository;
import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.entity.InvoiceLine;
import com.accounting.platform.invoice.entity.InvoiceStatus;
import com.accounting.platform.invoice.repository.InvoiceRepository;
import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.entity.JournalEntryLine;
import com.accounting.platform.journal.service.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final JournalEntryService journalEntryService;
    private final AccountRepository accountRepository;
    private final com.accounting.platform.tax.repository.TaxRateRepository taxRateRepository;
    private final ContactRepository contactRepository;
    private final AuditService auditService;

    public Page<Invoice> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable);
    }

    public Invoice getInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
    }

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        // Ensure entity is treated as new
        invoice.setId(null);
        invoice.setVersion(null);

        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isEmpty()) {
            invoice.setInvoiceNumber(generateInvoiceNumber());
        }

        if (invoiceRepository.existsByInvoiceNumber(invoice.getInvoiceNumber())) {
            throw new IllegalArgumentException("Invoice number already exists");
        }

        if (invoice.getStatus() == null) {
            invoice.setStatus(InvoiceStatus.DRAFT);
        }

        if (invoice.getContact() != null && invoice.getContact().getId() != null) {
            Contact contact = contactRepository.findById(invoice.getContact().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Contact not found"));
            invoice.setContact(contact);
        } else {
             throw new IllegalArgumentException("Contact is required");
        }

        enrichLines(invoice);

        if (invoice.getLines() != null) {
            invoice.getLines().forEach(line -> {
                line.setId(null); // Ensure lines are new
                line.setInvoice(invoice);
            });
            invoice.calculateTotal();
        }

        Invoice saved = invoiceRepository.save(invoice);
        auditService.logCreate("Invoice", saved.getId(), saved);
        return saved;
    }

    @Transactional
    public Invoice updateInvoice(UUID id, Invoice invoiceDetails) {
        Invoice invoice = getInvoiceById(id);

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Cannot update invoice that is not in DRAFT status");
        }

        invoice.setIssueDate(invoiceDetails.getIssueDate());
        invoice.setDueDate(invoiceDetails.getDueDate());
        invoice.setReference(invoiceDetails.getReference());
        invoice.setNotes(invoiceDetails.getNotes());

        enrichLines(invoiceDetails);

        // Basic merge of lines
        invoice.getLines().clear();
        if (invoiceDetails.getLines() != null) {
            invoiceDetails.getLines().forEach(invoice::addLine);
        }
        invoice.calculateTotal();

        Invoice updated = invoiceRepository.save(invoice);
        auditService.logUpdate("Invoice", updated.getId(), null, updated);
        return updated;
    }

    private void enrichLines(Invoice invoice) {
        if (invoice.getLines() == null) return;

        invoice.getLines().forEach(line -> {
            if (line.getRevenueAccount() != null && line.getRevenueAccount().getId() != null) {
                line.setRevenueAccount(accountRepository.findById(line.getRevenueAccount().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Revenue Account not found")));
            }
            if (line.getTaxRate() != null && line.getTaxRate().getId() != null) {
                line.setTaxRate(taxRateRepository.findById(line.getTaxRate().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Tax Rate not found")));
            }
        });
    }



    @Transactional
    public Invoice approveInvoice(UUID id) {
        Invoice invoice = getInvoiceById(id);

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Invoice is already approved or voided");
        }

        if (invoice.getLines().isEmpty()) {
            throw new IllegalStateException("Invoice must have at least one line item");
        }

        // 1. Find Accounts Receivable Account
        // In a real app, this should come from Organization Settings or Customer default
        // For now, we find the first active AR account
        Account arAccount = accountRepository.findAll().stream()
                .filter(a -> a.getSubtype() == AccountSubtype.ACCOUNTS_RECEIVABLE && a.isActive())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active Accounts Receivable account found"));

        // 2. Create Journal Entry
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(invoice.getIssueDate());
        entry.setDescription("Invoice #" + invoice.getInvoiceNumber() + " for " + invoice.getContact().getName());
        entry.setReferenceNumber(invoice.getInvoiceNumber());

        // Debit AR (Total Amount)
        JournalEntryLine debitLine = new JournalEntryLine();
        debitLine.setAccount(arAccount);
        debitLine.setDebit(invoice.getTotalAmount());
        debitLine.setDescription("Invoice " + invoice.getInvoiceNumber());
        entry.addLine(debitLine);

        // Credit Revenue (Per Line)
        BigDecimal totalTaxAmount = BigDecimal.ZERO;

        for (InvoiceLine line : invoice.getLines()) {
            JournalEntryLine creditLine = new JournalEntryLine();
            creditLine.setAccount(line.getRevenueAccount());
            creditLine.setCredit(line.getAmount());
            creditLine.setDescription(line.getDescription());
            entry.addLine(creditLine);

            if (line.getTaxAmount() != null) {
                totalTaxAmount = totalTaxAmount.add(line.getTaxAmount());
            }
        }

        // Credit Sales Tax Payable
        if (totalTaxAmount.compareTo(BigDecimal.ZERO) > 0) {
            Account taxAccount = accountRepository.findAll().stream()
                    .filter(a -> a.getSubtype() == AccountSubtype.SALES_TAX_PAYABLE && a.isActive())
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No active Sales Tax Payable account found"));

            JournalEntryLine taxLine = new JournalEntryLine();
            taxLine.setAccount(taxAccount);
            taxLine.setCredit(totalTaxAmount);
            taxLine.setDescription("Sales Tax for Invoice #" + invoice.getInvoiceNumber());
            entry.addLine(taxLine);
        }

        JournalEntry createdEntry = journalEntryService.createEntry(entry);
        journalEntryService.postEntry(createdEntry.getId());

        // 3. Update Invoice Status
        invoice.setStatus(InvoiceStatus.SENT); // Or APPROVED
        Invoice saved = invoiceRepository.save(invoice);

        auditService.logAction("APPROVE_INVOICE", "Invoice", id, "Created Journal Entry " + createdEntry.getReferenceNumber());

        return saved;
    }

    @Transactional
    public Invoice payInvoice(UUID id, com.accounting.platform.invoice.dto.PaymentRequestDto request) {
        Invoice invoice = getInvoiceById(id);

        if (invoice.getStatus() != InvoiceStatus.SENT) {
            if (invoice.getStatus() == InvoiceStatus.PAID) {
                throw new IllegalStateException("Invoice is already paid");
            }
             throw new IllegalStateException("Invoice must be APPROVED/SENT before payment");
        }

        Account bankAccount = accountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Bank Account not found"));

        if (bankAccount.getSubtype() != AccountSubtype.BANK && bankAccount.getSubtype() != AccountSubtype.CASH) {
            throw new IllegalArgumentException("Selected account is not a Bank or Cash account");
        }

        // Find Accounts Receivable Account (Re-query or assume same as approval)
        Account arAccount = accountRepository.findAll().stream()
                .filter(a -> a.getSubtype() == AccountSubtype.ACCOUNTS_RECEIVABLE && a.isActive())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active Accounts Receivable account found"));

        // Create Journal Entry
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(request.getPaymentDate());
        entry.setDescription("Payment for Invoice #" + invoice.getInvoiceNumber());
        entry.setReferenceNumber("PAY-" + invoice.getInvoiceNumber());

        // Debit Bank (Asset Increases)
        JournalEntryLine debitBank = new JournalEntryLine();
        debitBank.setAccount(bankAccount);
        debitBank.setDebit(invoice.getTotalAmount());
        debitBank.setDescription("Payment Received");
        entry.addLine(debitBank);

        // Credit Accounts Receivable (Asset Decreases)
        JournalEntryLine creditAR = new JournalEntryLine();
        creditAR.setAccount(arAccount);
        creditAR.setCredit(invoice.getTotalAmount());
        creditAR.setDescription("Invoice #" + invoice.getInvoiceNumber() + " Payment");
        entry.addLine(creditAR);

        JournalEntry createdEntry = journalEntryService.createEntry(entry);
        journalEntryService.postEntry(createdEntry.getId());

        // Update Invoice
        invoice.setStatus(InvoiceStatus.PAID);
        Invoice saved = invoiceRepository.save(invoice);

        auditService.logAction("PAY_INVOICE", "Invoice", id, "Registered Payment " + createdEntry.getReferenceNumber());

        return saved;
    }

    @Transactional
    public void deleteInvoice(UUID id) {
        Invoice invoice = getInvoiceById(id);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT invoices can be deleted");
        }
        invoiceRepository.delete(invoice);
        auditService.logAction("DELETE_INVOICE", "Invoice", id, null);
    }

    private String generateInvoiceNumber() {
        // Simple generation strategy: INV-{CurrentTimeMillis} to ensure uniqueness for now.
        // in a real app, this would use a sequence or configuration.
        return "INV-" + System.currentTimeMillis();
    }
}
