package com.accounting.platform.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AgingReportDto(
    String reportType, // "RECEIVABLES" or "PAYABLES"
    LocalDate reportDate,
    List<AgingBucketDto> buckets,
    BigDecimal totalOutstanding,
    int totalCount
) {
    public record AgingBucketDto(
        String label,
        int daysStart,
        int daysEnd,
        BigDecimal amount,
        int count,
        List<AgingLineDto> details
    ) {}

    public record AgingLineDto(
        String contactId,
        String contactName,
        String documentNumber,
        LocalDate documentDate,
        LocalDate dueDate,
        int daysOverdue,
        BigDecimal amount,
        String currency
    ) {}
}
