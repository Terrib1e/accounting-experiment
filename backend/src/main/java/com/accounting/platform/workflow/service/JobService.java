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

    public JobDto createJob(JobDto dto) {
        Job job = jobMapper.toEntity(dto);

        // Link Workflow
        Workflow workflow = workflowRepository.findById(dto.getWorkflowId())
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));
        job.setWorkflow(workflow);

        // Link Contact
        Contact contact = contactRepository.findById(dto.getContactId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        job.setContact(contact);

        // Set Initial Stage
        WorkflowStage initialStage = workflow.getStages().stream()
                .filter(WorkflowStage::isInitial)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Workflow has no initial stage"));
        job.setCurrentStage(initialStage);

        return jobMapper.toDto(jobRepository.save(job));
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
