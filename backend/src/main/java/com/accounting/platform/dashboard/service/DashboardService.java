package com.accounting.platform.dashboard.service;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.dashboard.dto.ActivityItemDto;
import com.accounting.platform.dashboard.dto.DashboardStatsDto;
import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.entity.ExpenseStatus;
import com.accounting.platform.expense.repository.ExpenseRepository;
import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.entity.InvoiceStatus;
import com.accounting.platform.invoice.repository.InvoiceRepository;
import com.accounting.platform.journal.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final ContactRepository contactRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        // Calculate Totals
        BigDecimal totalRevenue = invoiceRepository.sumTotalAmountByStatusIn(List.of(InvoiceStatus.PAID, InvoiceStatus.SENT));
        BigDecimal outstandingInvoices = invoiceRepository.sumTotalAmountByStatusIn(List.of(InvoiceStatus.SENT));
        BigDecimal totalExpenses = expenseRepository.sumTotalAmountByStatusIn(List.of(ExpenseStatus.APPROVED, ExpenseStatus.PAID));
        BigDecimal netCash = journalEntryRepository.getNetCashBalance();

        // Get Recent Activity
        List<ActivityItemDto> activity = new ArrayList<>();

        // Recent Invoices
        List<Invoice> recentInvoices = invoiceRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        activity.addAll(recentInvoices.stream().map(this::mapInvoiceToActivity).toList());

        // Recent Expenses
        List<Expense> recentExpenses = expenseRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        activity.addAll(recentExpenses.stream().map(this::mapExpenseToActivity).toList());

        // Recent Contacts (Vendors/Clients)
        List<Contact> recentContacts = contactRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        activity.addAll(recentContacts.stream().map(this::mapContactToActivity).toList());

        // Sort by date desc and limit to 10
        List<ActivityItemDto> sortedActivity = activity.stream()
                .sorted(Comparator.comparing(ActivityItemDto::getDate).reversed())
                .limit(10)
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .outstandingInvoices(outstandingInvoices != null ? outstandingInvoices : BigDecimal.ZERO)
                .totalExpenses(totalExpenses != null ? totalExpenses : BigDecimal.ZERO)
                .netCash(netCash != null ? netCash : BigDecimal.ZERO)
                .recentActivity(sortedActivity)
                .revenueTrend("+0%") // TODO: Calculate actual trends
                .outstandingTrend("0 unpaid")
                .expenseTrend("-0%")
                .netCashTrend("+0%")
                .build();
    }

    private ActivityItemDto mapInvoiceToActivity(Invoice invoice) {
        return ActivityItemDto.builder()
                .id(invoice.getId().toString())
                .type("INVOICE")
                .title("Invoice " + invoice.getInvoiceNumber())
                .subtitle(invoice.getContact().getName())
                .amount(invoice.getTotalAmount())
                .date(java.time.LocalDateTime.ofInstant(invoice.getCreatedAt(), java.time.ZoneId.systemDefault()))
                .status(invoice.getStatus().name())
                .icon("receipt")
                .colorClass("text-primary-600")
                .build();
    }

    private ActivityItemDto mapExpenseToActivity(Expense expense) {
        return ActivityItemDto.builder()
                .id(expense.getId().toString())
                .type("EXPENSE")
                .title("Expense " + expense.getReferenceNumber())
                .subtitle(expense.getVendor().getName())
                .amount(expense.getTotalAmount())
                .date(java.time.LocalDateTime.ofInstant(expense.getCreatedAt(), java.time.ZoneId.systemDefault()))
                .status(expense.getStatus().name())
                .icon("payments")
                .colorClass("text-red-600")
                .build();
    }

    private ActivityItemDto mapContactToActivity(Contact contact) {
        return ActivityItemDto.builder()
                .id(contact.getId().toString())
                .type("CONTACT")
                .title("New " + (contact.getType().name().equals("CUSTOMER") ? "Client" : "Vendor"))
                .subtitle(contact.getName())
                .amount(BigDecimal.ZERO)
                .date(java.time.LocalDateTime.ofInstant(contact.getCreatedAt(), java.time.ZoneId.systemDefault()))
                .status("ACTIVE")
                .icon("group_add")
                .colorClass("text-purple-600")
                .build();
    }

}
