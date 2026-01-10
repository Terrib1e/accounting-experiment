package com.accounting.platform.workflow.mapper;

import com.accounting.platform.workflow.dto.WorkflowDto;
import com.accounting.platform.workflow.entity.Workflow;
import com.accounting.platform.workflow.entity.WorkflowStage;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-09T14:16:58-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Amazon.com Inc.)"
)
@Component
public class WorkflowMapperImpl implements WorkflowMapper {

    @Override
    public WorkflowDto toDto(Workflow workflow) {
        if ( workflow == null ) {
            return null;
        }

        WorkflowDto workflowDto = new WorkflowDto();

        workflowDto.setId( workflow.getId() );
        workflowDto.setName( workflow.getName() );
        workflowDto.setDescription( workflow.getDescription() );
        workflowDto.setStages( workflowStageListToWorkflowStageDtoList( workflow.getStages() ) );

        return workflowDto;
    }

    @Override
    public Workflow toEntity(WorkflowDto dto) {
        if ( dto == null ) {
            return null;
        }

        Workflow workflow = new Workflow();

        workflow.setId( dto.getId() );
        workflow.setName( dto.getName() );
        workflow.setDescription( dto.getDescription() );
        workflow.setStages( workflowStageDtoListToWorkflowStageList( dto.getStages() ) );

        return workflow;
    }

    @Override
    public WorkflowDto.WorkflowStageDto toStageDto(WorkflowStage stage) {
        if ( stage == null ) {
            return null;
        }

        WorkflowDto.WorkflowStageDto workflowStageDto = new WorkflowDto.WorkflowStageDto();

        workflowStageDto.setId( stage.getId() );
        workflowStageDto.setName( stage.getName() );
        workflowStageDto.setOrderIndex( stage.getOrderIndex() );
        workflowStageDto.setInitial( stage.isInitial() );
        workflowStageDto.setFinalStage( stage.isFinalStage() );

        return workflowStageDto;
    }

    @Override
    public WorkflowStage toStageEntity(WorkflowDto.WorkflowStageDto dto) {
        if ( dto == null ) {
            return null;
        }

        WorkflowStage workflowStage = new WorkflowStage();

        workflowStage.setId( dto.getId() );
        workflowStage.setName( dto.getName() );
        workflowStage.setOrderIndex( dto.getOrderIndex() );
        workflowStage.setInitial( dto.isInitial() );
        workflowStage.setFinalStage( dto.isFinalStage() );

        return workflowStage;
    }

    protected List<WorkflowDto.WorkflowStageDto> workflowStageListToWorkflowStageDtoList(List<WorkflowStage> list) {
        if ( list == null ) {
            return null;
        }

        List<WorkflowDto.WorkflowStageDto> list1 = new ArrayList<WorkflowDto.WorkflowStageDto>( list.size() );
        for ( WorkflowStage workflowStage : list ) {
            list1.add( toStageDto( workflowStage ) );
        }

        return list1;
    }

    protected List<WorkflowStage> workflowStageDtoListToWorkflowStageList(List<WorkflowDto.WorkflowStageDto> list) {
        if ( list == null ) {
            return null;
        }

        List<WorkflowStage> list1 = new ArrayList<WorkflowStage>( list.size() );
        for ( WorkflowDto.WorkflowStageDto workflowStageDto : list ) {
            list1.add( toStageEntity( workflowStageDto ) );
        }

        return list1;
    }
}
