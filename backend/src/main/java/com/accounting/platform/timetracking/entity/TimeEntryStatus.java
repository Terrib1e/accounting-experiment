package com.accounting.platform.timetracking.entity;

/**
 * Status of a time entry in the billing workflow.
 */
public enum TimeEntryStatus {
    DRAFT,          // Initial state, can be edited
    SUBMITTED,      // Submitted for approval
    APPROVED,       // Approved, ready to bill
    BILLED,         // Included in an invoice
    WRITTEN_OFF     // Will not be billed
}
