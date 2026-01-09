package com.accounting.platform.workflow.service;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.workflow.dto.JobDto;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.entity.Workflow;
import com.accounting.platform.workflow.entity.WorkflowStage;
import com.accounting.platform.workflow.mapper.JobMapper;
import com.accounting.platform.workflow.repository.JobRepository;
import com.accounting.platform.workflow.repository.WorkflowRepository;
import com.accounting.platform.notification.service.NotificationService;
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
public class JobService {

    private final JobRepository jobRepository;
    private final WorkflowRepository workflowRepository;
    private final ContactRepository contactRepository;
    private final JobMapper jobMapper;
    private final NotificationService notificationService;

    public JobDto createJob(JobDto dto) {
        Job job = jobMapper.toEntity(dto);

        // Link Workflow (with eager fetch of stages)
        Workflow workflow = workflowRepository.findByIdWithStages(dto.getWorkflowId())
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));
        job.setWorkflow(workflow);

        // Link Contact
        Contact contact = contactRepository.findById(dto.getContactId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        job.setContact(contact);

        // Set Initial Stage (fallback to first stage by orderIndex if none marked as initial)
        WorkflowStage initialStage = workflow.getStages().stream()
                .filter(WorkflowStage::isInitial)
                .findFirst()
                .orElseGet(() -> workflow.getStages().stream()
                        .min((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
                        .orElseThrow(() -> new IllegalStateException("Workflow has no stages")));
        job.setCurrentStage(initialStage);

        Job savedJob = jobRepository.save(job);

        notificationService.notifyJobCreated(contact.getName(), savedJob.getId());

        return jobMapper.toDto(savedJob);
    }

    public JobDto updateStage(UUID jobId, UUID stageId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job not found"));

        // Find stage in current workflow
        WorkflowStage newStage = job.getWorkflow().getStages().stream()
                .filter(s -> s.getId().equals(stageId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Stage does not belong to this workflow"));

        job.setCurrentStage(newStage);
        return jobMapper.toDto(jobRepository.save(job));
    }

    public JobDto updateJob(UUID jobId, JobDto dto) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job not found"));

        // Update basic fields
        job.setName(dto.getName());
        job.setDueDate(dto.getDueDate());
        job.setAssigneeId(dto.getAssigneeId());

        // Update workflow if changed
        if (dto.getWorkflowId() != null && !dto.getWorkflowId().equals(job.getWorkflow().getId())) {
            Workflow workflow = workflowRepository.findByIdWithStages(dto.getWorkflowId())
                    .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));
            job.setWorkflow(workflow);
            // Set to initial stage of new workflow, or first stage by order if none marked as initial
            WorkflowStage newStage = workflow.getStages().stream()
                    .filter(WorkflowStage::isInitial)
                    .findFirst()
                    .orElseGet(() -> workflow.getStages().stream()
                            .min((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
                            .orElse(null));
            if (newStage != null) {
                job.setCurrentStage(newStage);
            }
        }

        // Update contact if changed
        if (dto.getContactId() != null && !dto.getContactId().equals(job.getContact().getId())) {
            Contact contact = contactRepository.findById(dto.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
            job.setContact(contact);
        }

        return jobMapper.toDto(jobRepository.save(job));
    }

    @Transactional(readOnly = true)
    public List<JobDto> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(jobMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobDto> getJobsByWorkflow(UUID workflowId) {
        return jobRepository.findByWorkflowId(workflowId).stream()
                .map(jobMapper::toDto)
                .collect(Collectors.toList());
    }
}
