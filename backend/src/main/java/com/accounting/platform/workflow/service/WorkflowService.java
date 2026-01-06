package com.accounting.platform.workflow.service;

import com.accounting.platform.workflow.dto.WorkflowDto;
import com.accounting.platform.workflow.entity.Workflow;
import com.accounting.platform.workflow.entity.WorkflowStage;
import com.accounting.platform.workflow.mapper.WorkflowMapper;
import com.accounting.platform.workflow.repository.WorkflowRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowMapper workflowMapper;

    public WorkflowDto createWorkflow(WorkflowDto dto) {
        Workflow workflow = workflowMapper.toEntity(dto);
        if (workflow.getStages() != null) {
            workflow.getStages().forEach(stage -> stage.setWorkflow(workflow));
        }
        return workflowMapper.toDto(workflowRepository.save(workflow));
    }

    @Transactional(readOnly = true)
    public List<WorkflowDto> getAllWorkflows() {
        return workflowRepository.findAll().stream()
                .map(workflowMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowDto getWorkflow(UUID id) {
        return workflowRepository.findById(id)
                .map(workflowMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));
    }

    public WorkflowDto updateWorkflow(UUID id, WorkflowDto dto) {
        Workflow existing = workflowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());

        // Clear existing stages to trigger orphanRemoval
        existing.getStages().clear();

        // Map and add new stages
        if (dto.getStages() != null) {
            List<WorkflowStage> newStages = dto.getStages().stream()
                .map(stageDto -> {
                    WorkflowStage stage = workflowMapper.toStageEntity(stageDto);
                    // Ensure ID is handled if passed, though usually new stages might not have IDs or we treat them as fresh
                    // For simplicity in this logic, we rely on the mapper.
                    // Important: We must set the workflow parent manually as the mapper might not set the back-reference
                    // when mapping a list of unrelated objects or if toEntity is simple.
                    return stage;
                })
                .collect(Collectors.toList());

            newStages.forEach(existing::addStage);
        }

        return workflowMapper.toDto(workflowRepository.save(existing));
    }

    public void deleteWorkflow(UUID id) {
        workflowRepository.deleteById(id);
    }
}
