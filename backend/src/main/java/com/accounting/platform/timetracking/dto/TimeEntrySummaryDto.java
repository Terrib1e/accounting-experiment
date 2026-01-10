package com.accounting.platform.timetracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntrySummaryDto {
    private Integer totalMinutesToday;
    private Integer totalMinutesThisWeek;
    private Integer totalMinutesThisMonth;

    private BigDecimal billableAmountThisWeek;
    private BigDecimal billableAmountThisMonth;

    private Integer unbilledCount;
    private BigDecimal unbilledAmount;

    private Boolean hasRunningTimer;
    private TimeEntryDto runningTimer;
}
