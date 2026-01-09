package com.accounting.platform.report.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.report.dto.FinancialReportDto;
import com.accounting.platform.report.dto.AgingReportDto;
import com.accounting.platform.report.service.ReportService;
import com.accounting.platform.report.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final ReportExportService exportService;

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

    @GetMapping("/aging/receivables")
    public ResponseEntity<ApiResponse<AgingReportDto>> getReceivablesAging(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(reportService.generateReceivablesAging(date)));
    }

    @GetMapping("/aging/payables")
    public ResponseEntity<ApiResponse<AgingReportDto>> getPayablesAging(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(reportService.generatePayablesAging(date)));
    }

    // ==================== PDF EXPORTS ====================

    @GetMapping("/balance-sheet/pdf")
    public ResponseEntity<byte[]> getBalanceSheetPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        FinancialReportDto report = reportService.generateBalanceSheet(date);
        byte[] pdf = exportService.exportFinancialReportToPdf(report);
        return createPdfResponse(pdf, "balance-sheet");
    }

    @GetMapping("/income-statement/pdf")
    public ResponseEntity<byte[]> getIncomeStatementPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        FinancialReportDto report = reportService.generateIncomeStatement(startDate, endDate);
        byte[] pdf = exportService.exportFinancialReportToPdf(report);
        return createPdfResponse(pdf, "income-statement");
    }

    @GetMapping("/trial-balance/pdf")
    public ResponseEntity<byte[]> getTrialBalancePdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        FinancialReportDto report = reportService.generateTrialBalance(date);
        byte[] pdf = exportService.exportFinancialReportToPdf(report);
        return createPdfResponse(pdf, "trial-balance");
    }

    @GetMapping("/aging/receivables/pdf")
    public ResponseEntity<byte[]> getReceivablesAgingPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        AgingReportDto report = reportService.generateReceivablesAging(date);
        byte[] pdf = exportService.exportAgingReportToPdf(report);
        return createPdfResponse(pdf, "ar-aging");
    }

    @GetMapping("/aging/payables/pdf")
    public ResponseEntity<byte[]> getPayablesAgingPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        AgingReportDto report = reportService.generatePayablesAging(date);
        byte[] pdf = exportService.exportAgingReportToPdf(report);
        return createPdfResponse(pdf, "ap-aging");
    }

    // ==================== EXCEL EXPORTS ====================

    @GetMapping("/balance-sheet/excel")
    public ResponseEntity<byte[]> getBalanceSheetExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        FinancialReportDto report = reportService.generateBalanceSheet(date);
        byte[] excel = exportService.exportFinancialReportToExcel(report);
        return createExcelResponse(excel, "balance-sheet");
    }

    @GetMapping("/income-statement/excel")
    public ResponseEntity<byte[]> getIncomeStatementExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        FinancialReportDto report = reportService.generateIncomeStatement(startDate, endDate);
        byte[] excel = exportService.exportFinancialReportToExcel(report);
        return createExcelResponse(excel, "income-statement");
    }

    @GetMapping("/trial-balance/excel")
    public ResponseEntity<byte[]> getTrialBalanceExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        FinancialReportDto report = reportService.generateTrialBalance(date);
        byte[] excel = exportService.exportFinancialReportToExcel(report);
        return createExcelResponse(excel, "trial-balance");
    }

    @GetMapping("/aging/receivables/excel")
    public ResponseEntity<byte[]> getReceivablesAgingExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        AgingReportDto report = reportService.generateReceivablesAging(date);
        byte[] excel = exportService.exportAgingReportToExcel(report);
        return createExcelResponse(excel, "ar-aging");
    }

    @GetMapping("/aging/payables/excel")
    public ResponseEntity<byte[]> getPayablesAgingExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        AgingReportDto report = reportService.generatePayablesAging(date);
        byte[] excel = exportService.exportAgingReportToExcel(report);
        return createExcelResponse(excel, "ap-aging");
    }

    // ==================== HELPERS ====================

    private ResponseEntity<byte[]> createPdfResponse(byte[] content, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }

    private ResponseEntity<byte[]> createExcelResponse(byte[] content, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }
}
