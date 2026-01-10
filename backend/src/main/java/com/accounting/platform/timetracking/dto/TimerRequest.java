package com.accounting.platform.timetracking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimerRequest {

    @NotBlank(message = "Description is required")
    private String description;

    private UUID jobId;

    private UUID contactId;
}
