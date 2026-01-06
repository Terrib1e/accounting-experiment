package com.accounting.platform.workflow.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TaskDto {
    private UUID id;
    private String title;
    private String description;

    private UUID jobId;
    private String jobName;

    private boolean isCompleted;
    private LocalDate dueDate;
    private String assigneeId;
}
