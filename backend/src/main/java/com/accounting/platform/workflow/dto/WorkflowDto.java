package com.accounting.platform.workflow.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WorkflowDto {
    private UUID id;
    private String name;
    private String description;
    private List<WorkflowStageDto> stages;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WorkflowStageDto {
        private UUID id;
        private String name;
        private Integer orderIndex;
        private boolean initial;
        private boolean finalStage;
    }
}
