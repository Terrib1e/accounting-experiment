package com.accounting.platform.workflow.mapper;

import com.accounting.platform.workflow.dto.TaskDto;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.entity.Task;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-05T23:23:37-0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class TaskMapperImpl implements TaskMapper {

    @Override
    public TaskDto toDto(Task task) {
        if ( task == null ) {
            return null;
        }

        TaskDto taskDto = new TaskDto();

        taskDto.setJobId( taskJobId( task ) );
        taskDto.setJobName( taskJobName( task ) );
        taskDto.setAssigneeId( task.getAssigneeId() );
        taskDto.setCompleted( task.isCompleted() );
        taskDto.setDescription( task.getDescription() );
        taskDto.setDueDate( task.getDueDate() );
        taskDto.setId( task.getId() );
        taskDto.setTitle( task.getTitle() );

        return taskDto;
    }

    @Override
    public Task toEntity(TaskDto dto) {
        if ( dto == null ) {
            return null;
        }

        Task task = new Task();

        task.setId( dto.getId() );
        task.setAssigneeId( dto.getAssigneeId() );
        task.setCompleted( dto.isCompleted() );
        task.setDescription( dto.getDescription() );
        task.setDueDate( dto.getDueDate() );
        task.setTitle( dto.getTitle() );

        return task;
    }

    private UUID taskJobId(Task task) {
        if ( task == null ) {
            return null;
        }
        Job job = task.getJob();
        if ( job == null ) {
            return null;
        }
        UUID id = job.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String taskJobName(Task task) {
        if ( task == null ) {
            return null;
        }
        Job job = task.getJob();
        if ( job == null ) {
            return null;
        }
        String name = job.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
