package com.accounting.platform.workflow.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class WorkflowDto {
    private UUID id;
    private String name;
    private String description;
    private List<WorkflowStageDto> stages;

    @Data
    public static class WorkflowStageDto {
        private UUID id;
        private String name;
        private Integer orderIndex;
        private boolean isInitial;
        private boolean isFinal;
    }
}
