package com.accounting.platform.config;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.entity.AccountSubtype;
import com.accounting.platform.account.entity.AccountType;
import com.accounting.platform.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.UUID;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class ChartOfAccountsSeeder {

    private final AccountRepository accountRepository;

    @Bean
    public CommandLineRunner seedChartOfAccounts() {
        return args -> {
            log.info("Seeding Chart of Accounts...");

            // Assets
            createAccount("1000", "Cash on Hand", "Petty cash and physical currency", AccountType.ASSET, AccountSubtype.CASH);
            createAccount("1010", "Checking Account", "Primary business checking", AccountType.ASSET, AccountSubtype.BANK);
            createAccount("1200", "Accounts Receivable", "Unpaid customer invoices", AccountType.ASSET, AccountSubtype.ACCOUNTS_RECEIVABLE);
            createAccount("1500", "Office Equipment", "Computers, furniture, etc.", AccountType.ASSET, AccountSubtype.FIXED_ASSET);

            // Liabilities
            createAccount("2000", "Accounts Payable", "Unpaid vendor bills", AccountType.LIABILITY, AccountSubtype.ACCOUNTS_PAYABLE);
            createAccount("2100", "Credit Card", "Business credit card", AccountType.LIABILITY, AccountSubtype.CREDIT_CARD);
            createAccount("2200", "Sales Tax Payable", "Tax collected to be remitted", AccountType.LIABILITY, AccountSubtype.SALES_TAX_PAYABLE);

            // Equity
            createAccount("3000", "Owner's Equity", "Capital invested by owner", AccountType.EQUITY, AccountSubtype.EQUITY);
            createAccount("3100", "Retained Earnings", "Accumulated net income", AccountType.EQUITY, AccountSubtype.RETAINED_EARNINGS);

            // Revenue
            createAccount("4000", "Sales Income", "Revenue from goods/services", AccountType.REVENUE, AccountSubtype.INCOME);
            createAccount("4100", "Consulting Income", "Revenue from consulting services", AccountType.REVENUE, AccountSubtype.INCOME);

            // Expenses
            createAccount("5000", "Cost of Goods Sold", "Direct costs of sold goods", AccountType.EXPENSE, AccountSubtype.COST_OF_GOODS_SOLD);
            createAccount("6000", "Advertising & Marketing", "Promotional expenses", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6010", "Bank Fees", "Service charges", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6020", "Dues & Subscriptions", "Software and memberships", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6030", "Insurance", "Liability and property insurance", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6040", "Meals & Entertainment", "Business meals", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6050", "Office Supplies", "Pens, paper, consumables", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6060", "Rent & Lease", "Office space rent", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6070", "Repairs & Maintenance", "Upkeep of assets", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("6080", "Utilities", "Electric, water, internet", AccountType.EXPENSE, AccountSubtype.OPERATING_EXPENSE);
            createAccount("7000", "Payroll Expenses", "Salaries and wages", AccountType.EXPENSE, AccountSubtype.PAYROLL_EXPENSE);

            log.info("Chart of Accounts Seeding Complete");
        };
    }

    private void createAccount(String code, String name, String description, AccountType type, AccountSubtype subtype) {
        if (accountRepository.existsByCode(code)) {
            return;
        }

        Account account = new Account();
        account.setCode(code);
        account.setName(name);
        account.setDescription(description);
        account.setType(type);
        account.setSubtype(subtype);
        account.setActive(true);
        account.setCurrency("USD");
        accountRepository.save(account);
        log.info("Created account: {} - {}", code, name);
    }
}
