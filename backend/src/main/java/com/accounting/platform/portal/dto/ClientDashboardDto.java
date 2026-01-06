package com.accounting.platform.portal.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ClientDashboardDto {
    private long outstandingInvoices;
    private BigDecimal totalOutstandingAmount;
    private long activeJobs;
    private long unreadDocuments;
    private String contactName;
}
