package com.accounting.platform.account.entity;

public enum AccountSubtype {
    // Assets
    CASH,
    BANK,
    CURRENT_ASSET,
    FIXED_ASSET,
    INVENTORY,
    ACCOUNTS_RECEIVABLE,

    // Liabilities
    CURRENT_LIABILITY,
    LONG_TERM_LIABILITY,
    ACCOUNTS_PAYABLE,
    CREDIT_CARD,
    SALES_TAX_PAYABLE,

    // Equity
    EQUITY,
    RETAINED_EARNINGS,

    // Revenue
    INCOME,
    OTHER_INCOME,

    // Expenses
    OPERATING_EXPENSE,
    COST_OF_GOODS_SOLD,
    PAYROLL_EXPENSE,
    OTHER_EXPENSE;

    @com.fasterxml.jackson.annotation.JsonCreator
    public static AccountSubtype fromString(String value) {
        if (value == null) {
            return null;
        }
        return AccountSubtype.valueOf(value.toUpperCase());
    }
}
