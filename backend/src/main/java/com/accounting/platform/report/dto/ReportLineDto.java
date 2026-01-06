package com.accounting.platform.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class ReportLineDto {
    private String accountName;
    private String accountCode;
    private BigDecimal balance; // For specific period or point in time

    @Builder.Default
    private List<ReportLineDto> children = new ArrayList<>();
}
