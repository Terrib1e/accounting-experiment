package com.accounting.platform.workflow.service;

import com.accounting.platform.workflow.dto.TaskDto;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.entity.Task;
import com.accounting.platform.workflow.mapper.TaskMapper;
import com.accounting.platform.workflow.repository.JobRepository;
import com.accounting.platform.workflow.repository.TaskRepository;
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
public class TaskService {

    private final TaskRepository taskRepository;
    private final JobRepository jobRepository;
    private final TaskMapper taskMapper;

    public TaskDto createTask(TaskDto dto) {
        Task task = taskMapper.toEntity(dto);

        Job job = jobRepository.findById(dto.getJobId())
                .orElseThrow(() -> new EntityNotFoundException("Job not found"));
        task.setJob(job);

        return taskMapper.toDto(taskRepository.save(task));
    }

    public TaskDto updateStatus(UUID taskId, boolean completed) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        task.setCompleted(completed);
        return taskMapper.toDto(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByJob(UUID jobId) {
        return taskRepository.findByJobId(jobId).stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }
}
