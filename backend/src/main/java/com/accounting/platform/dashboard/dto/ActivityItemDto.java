package com.accounting.platform.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ActivityItemDto {
    private String id;
    private String type; // INVOICE, EXPENSE, JOURNAL, CONTACT, PAYMENT
    private String title;
    private String subtitle; // e.g. Customer Name
    private BigDecimal amount;
    private LocalDateTime date;
    private String status;
    private String icon; // material icon name
    private String colorClass; // e.g. text-blue-600
}
