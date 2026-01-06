package com.accounting.platform.workflow.controller;

import com.accounting.platform.workflow.dto.TaskDto;
import com.accounting.platform.workflow.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management APIs")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Create a new task for a job")
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto dto) {
        return new ResponseEntity<>(taskService.createTask(dto), HttpStatus.CREATED);
    }

    @GetMapping("/job/{jobId}")
    @Operation(summary = "Get tasks by job")
    public ResponseEntity<List<TaskDto>> getTasksByJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(taskService.getTasksByJob(jobId));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task completion status")
    public ResponseEntity<TaskDto> updateStatus(@PathVariable UUID id, @RequestParam boolean completed) {
        return ResponseEntity.ok(taskService.updateStatus(id, completed));
    }
}
