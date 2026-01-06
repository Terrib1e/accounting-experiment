package com.accounting.platform.workflow.mapper;

import com.accounting.platform.workflow.dto.JobDto;
import com.accounting.platform.workflow.entity.Job;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JobMapper {

    @Mapping(source = "workflow.id", target = "workflowId")
    @Mapping(source = "workflow.name", target = "workflowName")
    @Mapping(source = "currentStage.id", target = "currentStageId")
    @Mapping(source = "currentStage.name", target = "currentStageName")
    @Mapping(source = "contact.id", target = "contactId")
    @Mapping(source = "contact.name", target = "contactName")
    JobDto toDto(Job job);

    @Mapping(target = "workflow", ignore = true)     // Set by service
    @Mapping(target = "currentStage", ignore = true) // Set by service
    @Mapping(target = "contact", ignore = true)      // Set by service
    Job toEntity(JobDto dto);
}
