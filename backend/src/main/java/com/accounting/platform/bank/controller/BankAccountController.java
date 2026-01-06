package com.accounting.platform.bank.controller;

import com.accounting.platform.bank.entity.BankAccount;
import com.accounting.platform.bank.entity.BankTransaction;
import com.accounting.platform.bank.service.BankAccountService;
import com.accounting.platform.bank.service.BankReconciliationService;
import com.accounting.platform.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bank-accounts")
@RequiredArgsConstructor
public class BankAccountController {

    private final BankAccountService bankAccountService;
    private final BankReconciliationService bankReconciliationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankAccount>>> getAllBankAccounts() {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.getAllBankAccounts()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BankAccount>> createBankAccount(@RequestBody @Valid BankAccount bankAccount) {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.createBankAccount(bankAccount)));
    }

    @PostMapping("/{id}/transactions/import")
    public ResponseEntity<ApiResponse<List<BankTransaction>>> importTransactions(
            @PathVariable UUID id,
            @RequestBody List<BankTransaction> transactions) {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.importTransactions(id, transactions)));
    }

    // Simplification for compilation - Suggestion DTO not fully wired
    /*
    @GetMapping("/{id}/reconcile/suggestions")
    public ResponseEntity<ApiResponse<List<BankReconciliationService.ReconciliationSuggestion>>> getSuggestions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(bankReconciliationService.getSuggestions(id)));
    }
    */

    @PostMapping("/transactions/{transactionId}/reconcile/{journalEntryId}")
    public ResponseEntity<ApiResponse<Void>> reconcileTransaction(
            @PathVariable UUID transactionId,
            @PathVariable UUID journalEntryId) {
        bankReconciliationService.reconcileTransaction(transactionId, journalEntryId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
