package com.accounting.platform.workflow.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.workflow.dto.WorkflowDto;
import com.accounting.platform.workflow.service.WorkflowService;
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
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
@Tag(name = "Workflows", description = "Workflow management APIs")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping
    @Operation(summary = "Create a new workflow")
    public ResponseEntity<ApiResponse<WorkflowDto>> createWorkflow(@Valid @RequestBody WorkflowDto dto) {
        return new ResponseEntity<>(ApiResponse.success(workflowService.createWorkflow(dto)), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all workflows")
    public ResponseEntity<ApiResponse<List<WorkflowDto>>> getAllWorkflows() {
        return ResponseEntity.ok(ApiResponse.success(workflowService.getAllWorkflows()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workflow by ID")
    public ResponseEntity<ApiResponse<WorkflowDto>> getWorkflow(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(workflowService.getWorkflow(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update workflow")
    public ResponseEntity<ApiResponse<WorkflowDto>> updateWorkflow(@PathVariable UUID id, @Valid @RequestBody WorkflowDto dto) {
        return ResponseEntity.ok(ApiResponse.success(workflowService.updateWorkflow(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete workflow")
    public ResponseEntity<ApiResponse<Void>> deleteWorkflow(@PathVariable UUID id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
