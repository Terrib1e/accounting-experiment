package com.accounting.platform.report.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class FinancialReportDto {
    private String reportName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Map<String, List<ReportLineDto>> sections; // e.g., "Assets", "Liabilities"
    private Map<String, java.math.BigDecimal> summary; // e.g. "Total Assets": 100.00
}
