package com.accounting.platform.workflow.mapper;

import com.accounting.platform.workflow.dto.TaskDto;
import com.accounting.platform.workflow.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.name", target = "jobName")
    TaskDto toDto(Task task);

    @Mapping(target = "job", ignore = true) // Set by service
    Task toEntity(TaskDto dto);
}
