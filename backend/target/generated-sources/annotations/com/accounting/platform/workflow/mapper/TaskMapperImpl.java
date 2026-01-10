package com.accounting.platform.workflow.mapper;

import com.accounting.platform.workflow.dto.TaskDto;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.entity.Task;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-09T14:16:58-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Amazon.com Inc.)"
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
        taskDto.setId( task.getId() );
        taskDto.setTitle( task.getTitle() );
        taskDto.setDescription( task.getDescription() );
        taskDto.setCompleted( task.isCompleted() );
        taskDto.setDueDate( task.getDueDate() );
        taskDto.setAssigneeId( task.getAssigneeId() );

        return taskDto;
    }

    @Override
    public Task toEntity(TaskDto dto) {
        if ( dto == null ) {
            return null;
        }

        Task task = new Task();

        task.setId( dto.getId() );
        task.setTitle( dto.getTitle() );
        task.setDescription( dto.getDescription() );
        task.setCompleted( dto.isCompleted() );
        task.setDueDate( dto.getDueDate() );
        task.setAssigneeId( dto.getAssigneeId() );

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
