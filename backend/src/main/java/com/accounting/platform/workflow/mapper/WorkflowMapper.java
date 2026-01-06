package com.accounting.platform.workflow.mapper;

import com.accounting.platform.workflow.dto.WorkflowDto;
import com.accounting.platform.workflow.entity.Workflow;
import com.accounting.platform.workflow.entity.WorkflowStage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WorkflowMapper {
    WorkflowDto toDto(Workflow workflow);
    Workflow toEntity(WorkflowDto dto);

    WorkflowDto.WorkflowStageDto toStageDto(WorkflowStage stage);

    @Mapping(target = "workflow", ignore = true)
    WorkflowStage toStageEntity(WorkflowDto.WorkflowStageDto dto);
}
