package com.accounting.platform.report.service;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.entity.AccountType;
import com.accounting.platform.account.repository.AccountRepository;
import com.accounting.platform.journal.entity.JournalEntryStatus;
import com.accounting.platform.journal.repository.JournalEntryRepository;
import com.accounting.platform.report.dto.FinancialReportDto;
import com.accounting.platform.report.dto.ReportLineDto;
import com.accounting.platform.report.dto.AgingReportDto;
import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.entity.InvoiceStatus;
import com.accounting.platform.invoice.repository.InvoiceRepository;
import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.entity.ExpenseStatus;
import com.accounting.platform.expense.repository.ExpenseRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final EntityManager entityManager;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;

    public FinancialReportDto generateBalanceSheet(LocalDate asOfDate) {
        // 1. Fetch Balances for all ASSET, LIABILITY, EQUITY accounts
        Map<UUID, BigDecimal> balances = getBalancesAsOf(asOfDate);
        List<Account> accounts = accountRepository.findAll();

        // 2. Calculate Retained Earnings (Revenue - Expense) for all time up to asOfDate
        BigDecimal retainedEarnings = calculateNetIncome(LocalDate.of(1970, 1, 1), asOfDate);

        // 3. Build Tree
        List<ReportLineDto> assets = buildSection(accounts, balances, AccountType.ASSET);
        List<ReportLineDto> liabilities = buildSection(accounts, balances, AccountType.LIABILITY);
        List<ReportLineDto> equity = buildSection(accounts, balances, AccountType.EQUITY);

        // Add Retained Earnings to Equity
        equity.add(ReportLineDto.builder()
                .accountName("Retained Earnings")
                .balance(retainedEarnings)
                .build());

        BigDecimal totalAssets = sumLines(assets);
        BigDecimal totalLiabilities = sumLines(liabilities);
        BigDecimal totalEquity = sumLines(equity);

        Map<String, List<ReportLineDto>> sections = new LinkedHashMap<>();
        sections.put("Assets", assets);
        sections.put("Liabilities", liabilities);
        sections.put("Equity", equity);

        Map<String, BigDecimal> summary = new LinkedHashMap<>();
        summary.put("Total Assets", totalAssets);
        summary.put("Total Liabilities", totalLiabilities);
        summary.put("Total Equity", totalEquity);
        summary.put("Total Liabilities and Equity", totalLiabilities.add(totalEquity));

        return FinancialReportDto.builder()
                .reportName("Balance Sheet")
                .endDate(asOfDate)
                .sections(sections)
                .summary(summary)
                .build();
    }

    public FinancialReportDto generateIncomeStatement(LocalDate startDate, LocalDate endDate) {
        // 1. Fetch Revenue and Expense balances for the period
        Map<UUID, BigDecimal> periodBalances = getBalancesForPeriod(startDate, endDate);
        List<Account> accounts = accountRepository.findAll();

        // 2. Build Sections
        List<ReportLineDto> revenue = buildSection(accounts, periodBalances, AccountType.REVENUE);
        List<ReportLineDto> expense = buildSection(accounts, periodBalances, AccountType.EXPENSE);

        BigDecimal totalRevenue = sumLines(revenue);
        BigDecimal totalExpense = sumLines(expense);
        BigDecimal netIncome = totalRevenue.subtract(totalExpense);

        Map<String, List<ReportLineDto>> sections = new LinkedHashMap<>();
        sections.put("Revenue", revenue);
        sections.put("Expenses", expense);

        Map<String, BigDecimal> summary = new LinkedHashMap<>();
        summary.put("Total Revenue", totalRevenue);
        summary.put("Total Expenses", totalExpense);
        summary.put("Net Income", netIncome);

        return FinancialReportDto.builder()
                .reportName("Income Statement")
                .startDate(startDate)
                .endDate(endDate)
                .sections(sections)
                .summary(summary)
                .build();
    }

    public FinancialReportDto generateTrialBalance(LocalDate asOfDate) {
        Map<UUID, BigDecimal> balances = getBalancesAsOf(asOfDate);
        List<Account> accounts = accountRepository.findAll();

        List<ReportLineDto> lines = new ArrayList<>();
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (Account account : accounts) {
            BigDecimal balance = balances.getOrDefault(account.getId(), BigDecimal.ZERO);
            if (balance.compareTo(BigDecimal.ZERO) == 0) continue;

            lines.add(ReportLineDto.builder()
                    .accountName(account.getName())
                    .accountCode(account.getCode())
                    .balance(balance)
                    .build());

             // In Trial Balance, traditionally Debits are +ve, Credits are -ve (or separate columns)
             // Here our getBalancesAsOf returns "Normal Balance" (Positive).
             // We need to know if it's a Debit or Credit based on Account Type for column assignment?
             // Simplification: Just list signed balances.
             // Asset/Expense: Normal Debit (+). Liability/Equity/Revenue: Normal Credit (-).
             // Actually `getBalancesAsOf` logic below currently returns raw signed sum (Debit - Credit).

             if (balance.compareTo(BigDecimal.ZERO) > 0) {
                 totalDebit = totalDebit.add(balance);
             } else {
                 totalCredit = totalCredit.add(balance.abs());
             }
        }

        Map<String, BigDecimal> summary = new LinkedHashMap<>();
        summary.put("Total Debits", totalDebit);
        summary.put("Total Credits", totalCredit);

        return FinancialReportDto.builder()
                .reportName("Trial Balance")
                .endDate(asOfDate)
                .sections(Map.of("Accounts", lines))
                .summary(summary)
                .build();
    }

    private Map<UUID, BigDecimal> getBalancesAsOf(LocalDate date) {
        // Sum (Debit - Credit) for all lines up to date where Journal Status = POSTED
        String sql = """
            SELECT l.account_id, SUM(l.debit - l.credit) as balance
            FROM journal_entry_lines l
            JOIN journal_entries h ON l.journal_entry_id = h.id
            WHERE h.status = 'POSTED' AND h.entry_date <= :date
            GROUP BY l.account_id
        """;

        List<Tuple> results = entityManager.createNativeQuery(sql, Tuple.class)
                .setParameter("date", date)
                .getResultList();

        Map<UUID, BigDecimal> balances = new HashMap<>();
        for (Tuple t : results) {
            balances.put((UUID) t.get("account_id"), (BigDecimal) t.get("balance"));
        }
        return balances;
    }

    private Map<UUID, BigDecimal> getBalancesForPeriod(LocalDate start, LocalDate end) {
        // Sum (Credit - Debit) for Revenue/Equity/Liab (Normal Credit)
        // BUT wait, to keep it consistent, let's just do (Debit - Credit) and flip sign based on account type later if needed.
        // Usually Income Statement: Revenue is Credit (+), Expense is Debit (+).
        // Let's retrieve raw (Credit - Debit) for P&L accounts so valid Revenues are positive.

        String sql = """
            SELECT l.account_id, SUM(l.credit - l.debit) as balance
            FROM journal_entry_lines l
            JOIN journal_entries h ON l.journal_entry_id = h.id
            WHERE h.status = 'POSTED' AND h.entry_date BETWEEN :start AND :end
            GROUP BY l.account_id
        """;

        List<Tuple> results = entityManager.createNativeQuery(sql, Tuple.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        Map<UUID, BigDecimal> balances = new HashMap<>();
        for (Tuple t : results) {
            balances.put((UUID) t.get("account_id"), (BigDecimal) t.get("balance"));
        }
        return balances;
    }

    private BigDecimal calculateNetIncome(LocalDate start, LocalDate end) {
        // Revenue - Expenses
        Map<UUID, BigDecimal> balances = getBalancesForPeriod(start, end);
        List<Account> accounts = accountRepository.findAll();

        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;

        for (Account a : accounts) {
            BigDecimal bal = balances.getOrDefault(a.getId(), BigDecimal.ZERO);
            if (a.getType() == AccountType.REVENUE) {
                revenue = revenue.add(bal);
            } else if (a.getType() == AccountType.EXPENSE) {
                // Initial query was Credit - Debit. Expense normal matches Debit.
                // So Expense account which has high Debits will be NEGATIVE in (Credit - Debit).
                // Example: Debit 100. Query result: -100.
                // We want to subtract Expenses.
                // Net Income = Revenue - Expense.
                // If query returns -100 for expense. Revenue 500.
                // Total Sum (Credit-Debit) across all P&L accounts = 500 + (-100) = 400.
                // So actually, just summing the raw (Credit-Debit) results for all Revenue and Expense accounts gives Net Income.
                if (a.getType() == AccountType.REVENUE || a.getType() == AccountType.EXPENSE) {
                    // Just accumulate
                }
            }
        }

        // Simpler: Just sum all P&L account balances from that query
        return balances.entrySet().stream()
                .filter(e -> {
                    Account a = getAccount(accounts, e.getKey());
                    return a != null && (a.getType() == AccountType.REVENUE || a.getType() == AccountType.EXPENSE);
                })
                .map(Map.Entry::getValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ReportLineDto> buildSection(List<Account> allAccounts, Map<UUID, BigDecimal> balances, AccountType type) {
        return allAccounts.stream()
                .filter(a -> a.getType() == type)
                .map(a -> {
                    BigDecimal rawBal = balances.getOrDefault(a.getId(), BigDecimal.ZERO);
                    // Normalization
                    // Asset/Expense: want positive if Debit > Credit.
                    // Liab/Equity/Revenue: want positive if Credit > Debit.

                    BigDecimal displayBal = rawBal;

                    // getBalancesAsOf returns (Debit - Credit).
                    // So Assets are positive. Liabilities are negative.
                    if (type == AccountType.LIABILITY || type == AccountType.EQUITY || type == AccountType.REVENUE) {
                        // getBalancesForPeriod returns (Credit - Debit), so Revenue is positive.
                        // But getBalancesAsOf used for BS returns (Debit - Credit), so Liab/Equity are negative.

                        // We need to know which query source we used? Or standardise.
                        // Let's allow passing in a "flipSign" boolean? Or standardise queries.

                        // FIX: check if we are in BS or IS context.
                        // BS uses getBalancesAsOf (Debit - Credit).
                        // ASSET = +ve. LIABILITY = -ve. EQUITY = -ve.
                        // We want to display them as positive numbers on the report usually.
                        displayBal = rawBal.negate();
                    }

                    // IS uses getBalancesForPeriod (Credit - Debit).
                    // REVENUE = +ve. EXPENSE = -ve (because expenses are debits).
                    // We want to display Expenses as positive numbers usually (Revenue 100, Expense 50).
                    if (type == AccountType.EXPENSE) {
                         displayBal = rawBal.negate();
                    } else if (type == AccountType.REVENUE) {
                        // already positive
                    }

                    if (displayBal.compareTo(BigDecimal.ZERO) == 0) return null;

                    return ReportLineDto.builder()
                            .accountName(a.getName())
                            .accountCode(a.getCode())
                            .balance(displayBal)
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private Account getAccount(List<Account> accounts, UUID id) {
        return accounts.stream().filter(a -> a.getId().equals(id)).findFirst().orElse(null);
    }

    private BigDecimal sumLines(List<ReportLineDto> lines) {
        return lines.stream()
                .map(ReportLineDto::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ==================== AGING REPORTS ====================

    public AgingReportDto generateReceivablesAging(LocalDate asOfDate) {
        // Get all unpaid invoices (SENT, APPROVED, PARTIALLY_PAID, OVERDUE)
        List<Invoice> unpaidInvoices = invoiceRepository.findAll().stream()
            .filter(i -> i.getStatus() != InvoiceStatus.PAID &&
                         i.getStatus() != InvoiceStatus.VOID &&
                         i.getStatus() != InvoiceStatus.DRAFT)
            .filter(i -> !i.getDueDate().isAfter(asOfDate.plusDays(365))) // reasonable filter
            .toList();

        return buildAgingReport("RECEIVABLES", asOfDate, unpaidInvoices.stream()
            .map(inv -> new AgingItem(
                inv.getContact().getId().toString(),
                inv.getContact().getName(),
                inv.getInvoiceNumber(),
                inv.getIssueDate(),
                inv.getDueDate(),
                inv.getTotalAmount().subtract(inv.getAmountPaid() != null ? inv.getAmountPaid() : BigDecimal.ZERO),
                inv.getCurrency()
            ))
            .toList());
    }

    public AgingReportDto generatePayablesAging(LocalDate asOfDate) {
        // Get all unpaid expenses (APPROVED, not PAID, not VOID)
        List<Expense> unpaidExpenses = expenseRepository.findAll().stream()
            .filter(e -> e.getStatus() == ExpenseStatus.APPROVED)
            .filter(e -> e.getDueDate() == null || !e.getDueDate().isAfter(asOfDate.plusDays(365)))
            .toList();

        return buildAgingReport("PAYABLES", asOfDate, unpaidExpenses.stream()
            .map(exp -> new AgingItem(
                exp.getVendor().getId().toString(),
                exp.getVendor().getName(),
                exp.getReferenceNumber() != null ? exp.getReferenceNumber() : "EXP-" + exp.getId().toString().substring(0, 8),
                exp.getDate(),
                exp.getDueDate() != null ? exp.getDueDate() : exp.getDate().plusDays(30),
                exp.getTotalAmount(),
                exp.getCurrency()
            ))
            .toList());
    }

    private record AgingItem(
        String contactId,
        String contactName,
        String documentNumber,
        LocalDate documentDate,
        LocalDate dueDate,
        BigDecimal amount,
        String currency
    ) {}

    private AgingReportDto buildAgingReport(String reportType, LocalDate asOfDate, List<AgingItem> items) {
        // Define aging buckets
        List<BucketDef> bucketDefs = List.of(
            new BucketDef("Current", Integer.MIN_VALUE, 0),
            new BucketDef("1-30 Days", 1, 30),
            new BucketDef("31-60 Days", 31, 60),
            new BucketDef("61-90 Days", 61, 90),
            new BucketDef("90+ Days", 91, Integer.MAX_VALUE)
        );

        List<AgingReportDto.AgingBucketDto> buckets = new ArrayList<>();
        BigDecimal totalOutstanding = BigDecimal.ZERO;
        int totalCount = 0;

        for (BucketDef def : bucketDefs) {
            List<AgingReportDto.AgingLineDto> details = new ArrayList<>();
            BigDecimal bucketAmount = BigDecimal.ZERO;

            for (AgingItem item : items) {
                long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(item.dueDate(), asOfDate);

                boolean inBucket;
                if (def.start() == Integer.MIN_VALUE) {
                    inBucket = daysOverdue <= def.end();
                } else if (def.end() == Integer.MAX_VALUE) {
                    inBucket = daysOverdue >= def.start();
                } else {
                    inBucket = daysOverdue >= def.start() && daysOverdue <= def.end();
                }

                if (inBucket) {
                    details.add(new AgingReportDto.AgingLineDto(
                        item.contactId(),
                        item.contactName(),
                        item.documentNumber(),
                        item.documentDate(),
                        item.dueDate(),
                        (int) daysOverdue,
                        item.amount(),
                        item.currency()
                    ));
                    bucketAmount = bucketAmount.add(item.amount());
                }
            }

            buckets.add(new AgingReportDto.AgingBucketDto(
                def.label(),
                def.start() == Integer.MIN_VALUE ? 0 : def.start(),
                def.end() == Integer.MAX_VALUE ? 999 : def.end(),
                bucketAmount,
                details.size(),
                details
            ));

            totalOutstanding = totalOutstanding.add(bucketAmount);
            totalCount += details.size();
        }

        return new AgingReportDto(
            reportType,
            asOfDate,
            buckets,
            totalOutstanding,
            totalCount
        );
    }

    private record BucketDef(String label, int start, int end) {}
}
