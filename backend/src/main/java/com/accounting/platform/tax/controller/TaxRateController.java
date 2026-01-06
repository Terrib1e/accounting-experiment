package com.accounting.platform.tax.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.tax.entity.TaxRate;
import com.accounting.platform.tax.service.TaxRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tax-rates")
@RequiredArgsConstructor
public class TaxRateController {

    private final TaxRateService taxRateService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TaxRate>>> getAllTaxRates(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(taxRateService.getAllTaxRates(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxRate>> getTaxRateById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(taxRateService.getTaxRateById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaxRate>> createTaxRate(@RequestBody @Valid TaxRate taxRate) {
        return ResponseEntity.ok(ApiResponse.success(taxRateService.createTaxRate(taxRate)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxRate>> updateTaxRate(@PathVariable UUID id, @RequestBody @Valid TaxRate taxRate) {
        return ResponseEntity.ok(ApiResponse.success(taxRateService.updateTaxRate(id, taxRate)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTaxRate(@PathVariable UUID id) {
        taxRateService.deleteTaxRate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
