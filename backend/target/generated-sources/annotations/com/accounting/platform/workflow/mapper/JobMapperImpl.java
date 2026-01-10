package com.accounting.platform.workflow.mapper;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.workflow.dto.JobDto;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.entity.Workflow;
import com.accounting.platform.workflow.entity.WorkflowStage;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-09T14:16:58-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Amazon.com Inc.)"
)
@Component
public class JobMapperImpl implements JobMapper {

    @Override
    public JobDto toDto(Job job) {
        if ( job == null ) {
            return null;
        }

        JobDto jobDto = new JobDto();

        jobDto.setWorkflowId( jobWorkflowId( job ) );
        jobDto.setWorkflowName( jobWorkflowName( job ) );
        jobDto.setCurrentStageId( jobCurrentStageId( job ) );
        jobDto.setCurrentStageName( jobCurrentStageName( job ) );
        jobDto.setContactId( jobContactId( job ) );
        jobDto.setContactName( jobContactName( job ) );
        jobDto.setId( job.getId() );
        jobDto.setName( job.getName() );
        jobDto.setDueDate( job.getDueDate() );
        jobDto.setAssigneeId( job.getAssigneeId() );

        return jobDto;
    }

    @Override
    public Job toEntity(JobDto dto) {
        if ( dto == null ) {
            return null;
        }

        Job job = new Job();

        job.setId( dto.getId() );
        job.setName( dto.getName() );
        job.setDueDate( dto.getDueDate() );
        job.setAssigneeId( dto.getAssigneeId() );

        return job;
    }

    private UUID jobWorkflowId(Job job) {
        if ( job == null ) {
            return null;
        }
        Workflow workflow = job.getWorkflow();
        if ( workflow == null ) {
            return null;
        }
        UUID id = workflow.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String jobWorkflowName(Job job) {
        if ( job == null ) {
            return null;
        }
        Workflow workflow = job.getWorkflow();
        if ( workflow == null ) {
            return null;
        }
        String name = workflow.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private UUID jobCurrentStageId(Job job) {
        if ( job == null ) {
            return null;
        }
        WorkflowStage currentStage = job.getCurrentStage();
        if ( currentStage == null ) {
            return null;
        }
        UUID id = currentStage.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String jobCurrentStageName(Job job) {
        if ( job == null ) {
            return null;
        }
        WorkflowStage currentStage = job.getCurrentStage();
        if ( currentStage == null ) {
            return null;
        }
        String name = currentStage.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private UUID jobContactId(Job job) {
        if ( job == null ) {
            return null;
        }
        Contact contact = job.getContact();
        if ( contact == null ) {
            return null;
        }
        UUID id = contact.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String jobContactName(Job job) {
        if ( job == null ) {
            return null;
        }
        Contact contact = job.getContact();
        if ( contact == null ) {
            return null;
        }
        String name = contact.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
