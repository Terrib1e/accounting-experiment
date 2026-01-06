package com.accounting.platform.report.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.report.dto.FinancialReportDto;
import com.accounting.platform.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/balance-sheet")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getBalanceSheet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(reportService.generateBalanceSheet(date)));
    }

    @GetMapping("/income-statement")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getIncomeStatement(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(reportService.generateIncomeStatement(startDate, endDate)));
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getTrialBalance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(reportService.generateTrialBalance(date)));
    }
}
