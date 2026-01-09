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
        if (workflow.getStages() != null && !workflow.getStages().isEmpty()) {
            workflow.getStages().forEach(stage -> stage.setWorkflow(workflow));

            // Ensure at least one stage is marked as initial
            boolean hasInitial = workflow.getStages().stream().anyMatch(WorkflowStage::isInitial);
            if (!hasInitial) {
                workflow.getStages().stream()
                        .min((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
                        .ifPresent(stage -> stage.setInitial(true));
            }
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
        Workflow existing = workflowRepository.findByIdWithStages(id)
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());

        // Build a map of existing stages by ID for efficient lookup
        java.util.Map<UUID, WorkflowStage> existingStagesById = existing.getStages().stream()
                .filter(s -> s.getId() != null)
                .collect(Collectors.toMap(WorkflowStage::getId, s -> s));

        // Track which existing stage IDs are still present in the DTO
        java.util.Set<UUID> updatedStageIds = new java.util.HashSet<>();

        if (dto.getStages() != null) {
            for (var stageDto : dto.getStages()) {
                if (stageDto.getId() != null && existingStagesById.containsKey(stageDto.getId())) {
                    // Update existing stage in-place
                    WorkflowStage existingStage = existingStagesById.get(stageDto.getId());
                    existingStage.setName(stageDto.getName());
                    existingStage.setOrderIndex(stageDto.getOrderIndex());
                    existingStage.setInitial(stageDto.isInitial());
                    existingStage.setFinal(stageDto.isFinal());
                    updatedStageIds.add(stageDto.getId());
                } else {
                    // Add new stage
                    WorkflowStage newStage = workflowMapper.toStageEntity(stageDto);
                    newStage.setId(null); // Ensure it's treated as new
                    existing.addStage(newStage);
                }
            }
        }

        // Remove stages that are no longer in the DTO
        existing.getStages().removeIf(stage ->
                stage.getId() != null && !updatedStageIds.contains(stage.getId()));

        // Ensure at least one stage is marked as initial
        if (!existing.getStages().isEmpty()) {
            boolean hasInitial = existing.getStages().stream().anyMatch(WorkflowStage::isInitial);
            if (!hasInitial) {
                existing.getStages().stream()
                        .min((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
                        .ifPresent(stage -> stage.setInitial(true));
            }
        }

        return workflowMapper.toDto(workflowRepository.save(existing));
    }

    public void deleteWorkflow(UUID id) {
        workflowRepository.deleteById(id);
    }
}
