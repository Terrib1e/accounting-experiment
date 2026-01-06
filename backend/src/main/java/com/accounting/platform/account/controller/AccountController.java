package com.accounting.platform.account.controller;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.service.AccountService;
import com.accounting.platform.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final com.accounting.platform.account.mapper.AccountMapper accountMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<com.accounting.platform.account.dto.AccountDto>>> getAllAccounts() {
        List<com.accounting.platform.account.dto.AccountDto> dtos = accountService.getAllAccounts().stream()
                .map(accountMapper::toDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<com.accounting.platform.account.dto.AccountHierarchyDto>>> getAccountHierarchy() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccountHierarchy()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<com.accounting.platform.account.dto.AccountDto>> getAccountById(@PathVariable UUID id) {
        return accountService.getAccountById(id)
                .map(account -> ResponseEntity.ok(ApiResponse.success(accountMapper.toDto(account))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<com.accounting.platform.account.dto.AccountDto>> createAccount(@RequestBody @Valid com.accounting.platform.account.dto.AccountDto accountDto) {
        Account account = accountMapper.toEntity(accountDto);
        Account created = accountService.createAccount(account);
        return ResponseEntity.ok(ApiResponse.success(accountMapper.toDto(created)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<com.accounting.platform.account.dto.AccountDto>> updateAccount(@PathVariable UUID id, @RequestBody @Valid com.accounting.platform.account.dto.AccountDto accountDto) {
        Account account = accountMapper.toEntity(accountDto);
        Account updated = accountService.updateAccount(id, account);
        return ResponseEntity.ok(ApiResponse.success(accountMapper.toDto(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable UUID id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
