package com.accounting.platform.workflow.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class JobDto {
    private UUID id;
    private String name;

    private UUID workflowId;
    private String workflowName;

    private UUID currentStageId;
    private String currentStageName;

    private UUID contactId;
    private String contactName;

    private LocalDate dueDate;
    private String assigneeId;
}
