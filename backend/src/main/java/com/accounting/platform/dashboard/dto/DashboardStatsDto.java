package com.accounting.platform.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStatsDto {
    private BigDecimal totalRevenue;
    private BigDecimal outstandingInvoices;
    private BigDecimal totalExpenses;
    private BigDecimal netCash;

    // Trends could be calculated, but optional for MVP
    private String revenueTrend;
    private String outstandingTrend;
    private String expenseTrend;
    private String netCashTrend;

    private List<ActivityItemDto> recentActivity;
}
