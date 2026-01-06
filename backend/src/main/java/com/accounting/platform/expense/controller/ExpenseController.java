package com.accounting.platform.expense.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Expense>>> getAllExpenses(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getAllExpenses(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Expense>> getExpenseById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getExpenseById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Expense>> createExpense(@RequestBody @Valid Expense expense) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.createExpense(expense)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Expense>> updateExpense(@PathVariable UUID id, @RequestBody @Valid Expense expense) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.updateExpense(id, expense)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Expense>> approveExpense(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.approveExpense(id)));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Expense>> payExpense(
            @PathVariable UUID id,
            @RequestBody @Valid com.accounting.platform.expense.dto.ExpensePaymentRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.payExpense(id, request)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
