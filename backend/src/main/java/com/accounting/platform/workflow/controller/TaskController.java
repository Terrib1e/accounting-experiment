package com.accounting.platform.workflow.controller;

import com.accounting.platform.common.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<TaskDto>> createTask(@Valid @RequestBody TaskDto dto) {
        return new ResponseEntity<>(ApiResponse.success(taskService.createTask(dto)), HttpStatus.CREATED);
    }

    @GetMapping("/job/{jobId}")
    @Operation(summary = "Get tasks by job")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasksByJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTasksByJob(jobId)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task completion status")
    public ResponseEntity<ApiResponse<TaskDto>> updateStatus(@PathVariable UUID id, @RequestParam boolean completed) {
        return ResponseEntity.ok(ApiResponse.success(taskService.updateStatus(id, completed)));
    }
}
