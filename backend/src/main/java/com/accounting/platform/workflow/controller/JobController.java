package com.accounting.platform.workflow.controller;

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
    public ResponseEntity<JobDto> createJob(@Valid @RequestBody JobDto dto) {
        return new ResponseEntity<>(jobService.createJob(dto), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all jobs")
    public ResponseEntity<List<JobDto>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/workflow/{workflowId}")
    @Operation(summary = "Get jobs by workflow")
    public ResponseEntity<List<JobDto>> getJobsByWorkflow(@PathVariable UUID workflowId) {
        return ResponseEntity.ok(jobService.getJobsByWorkflow(workflowId));
    }

    @PatchMapping("/{id}/stage/{stageId}")
    @Operation(summary = "Move job to a new stage")
    public ResponseEntity<JobDto> updateStage(@PathVariable UUID id, @PathVariable UUID stageId) {
        return ResponseEntity.ok(jobService.updateStage(id, stageId));
    }
}
