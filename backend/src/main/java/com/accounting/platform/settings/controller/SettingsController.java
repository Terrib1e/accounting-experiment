package com.accounting.platform.settings.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.settings.entity.FiscalPeriod;
import com.accounting.platform.settings.service.FiscalPeriodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.accounting.platform.settings.entity.OrganizationSettings;
import com.accounting.platform.settings.service.OrganizationSettingsService;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final FiscalPeriodService fiscalPeriodService;
    private final OrganizationSettingsService organizationSettingsService;

    // --- Fiscal Periods ---

    @GetMapping("/fiscal-periods")
    public ResponseEntity<ApiResponse<List<FiscalPeriod>>> getAllPeriods() {
        return ResponseEntity.ok(ApiResponse.success(fiscalPeriodService.getAllPeriods()));
    }

    @PostMapping("/fiscal-periods")
    public ResponseEntity<ApiResponse<FiscalPeriod>> createPeriod(@RequestBody @Valid FiscalPeriod period) {
        return ResponseEntity.ok(ApiResponse.success(fiscalPeriodService.createPeriod(period)));
    }

    @PostMapping("/fiscal-periods/{id}/close")
    public ResponseEntity<ApiResponse<FiscalPeriod>> closePeriod(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(fiscalPeriodService.closePeriod(id)));
    }

    // --- Organization Settings ---

    @GetMapping("/organization")
    public ResponseEntity<ApiResponse<OrganizationSettings>> getOrganizationSettings() {
         return ResponseEntity.ok(ApiResponse.success(organizationSettingsService.getSettings()));
    }

    @PutMapping("/organization")
    public ResponseEntity<ApiResponse<OrganizationSettings>> updateOrganizationSettings(@RequestBody OrganizationSettings settings) {
         return ResponseEntity.ok(ApiResponse.success(organizationSettingsService.updateSettings(settings)));
    }
}
