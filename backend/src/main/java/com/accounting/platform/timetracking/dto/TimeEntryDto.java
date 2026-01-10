package com.accounting.platform.timetracking.dto;

import com.accounting.platform.timetracking.entity.TimeEntryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryDto {
    private UUID id;
    private String description;

    private UUID jobId;
    private String jobName;

    private UUID contactId;
    private String contactName;

    private UUID userId;
    private String userName;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private Integer durationMinutes;
    private String formattedDuration;

    private Boolean billable;
    private BigDecimal billableRate;
    private BigDecimal billableAmount;

    private TimeEntryStatus status;
    private Boolean billed;
    private UUID invoiceId;

    private Boolean timerRunning;
    private Instant timerStartedAt;

    private Instant createdAt;
    private Instant updatedAt;
}
