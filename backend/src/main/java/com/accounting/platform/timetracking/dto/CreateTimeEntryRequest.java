package com.accounting.platform.timetracking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTimeEntryRequest {

    @NotBlank(message = "Description is required")
    private String description;

    private UUID jobId;

    private UUID contactId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private Boolean billable = true;

    private BigDecimal billableRate;
}
