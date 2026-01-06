package com.accounting.platform.recurring.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.recurring.entity.RecurringTemplate;
import com.accounting.platform.recurring.service.RecurringTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recurring-templates")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringTemplate>>> getAllTemplates() {
        return ResponseEntity.ok(ApiResponse.success(recurringTransactionService.getAllTemplates()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTemplate>> getTemplateById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(recurringTransactionService.getTemplateById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringTemplate>> createTemplate(@RequestBody @Valid RecurringTemplate template) {
        return ResponseEntity.ok(ApiResponse.success(recurringTransactionService.createTemplate(template)));
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<Void>> processDueTransactions() {
        recurringTransactionService.processDueTransactions();
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
