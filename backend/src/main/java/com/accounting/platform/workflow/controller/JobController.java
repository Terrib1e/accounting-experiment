package com.accounting.platform.workflow.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.workflow.dto.JobDto;
import com.accounting.platform.workflow.service.JobService;
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
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Job management APIs (Kanban)")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @Operation(summary = "Create a new job for a client")
    public ResponseEntity<ApiResponse<JobDto>> createJob(@Valid @RequestBody JobDto dto) {
        return new ResponseEntity<>(ApiResponse.success(jobService.createJob(dto)), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all jobs")
    public ResponseEntity<ApiResponse<List<JobDto>>> getAllJobs() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getAllJobs()));
    }

    @GetMapping("/workflow/{workflowId}")
    @Operation(summary = "Get jobs by workflow")
    public ResponseEntity<ApiResponse<List<JobDto>>> getJobsByWorkflow(@PathVariable UUID workflowId) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobsByWorkflow(workflowId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing job")
    public ResponseEntity<ApiResponse<JobDto>> updateJob(@PathVariable UUID id, @Valid @RequestBody JobDto dto) {
        return ResponseEntity.ok(ApiResponse.success(jobService.updateJob(id, dto)));
    }

    @PatchMapping("/{id}/stage/{stageId}")
    @Operation(summary = "Move job to a new stage")
    public ResponseEntity<ApiResponse<JobDto>> updateStage(@PathVariable UUID id, @PathVariable UUID stageId) {
        return ResponseEntity.ok(ApiResponse.success(jobService.updateStage(id, stageId)));
    }
}
