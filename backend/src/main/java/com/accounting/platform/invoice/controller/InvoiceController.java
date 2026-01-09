package com.accounting.platform.invoice.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import com.accounting.platform.invoice.service.PdfService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PdfService pdfService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Invoice>>> getAllInvoices(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) java.util.List<com.accounting.platform.invoice.entity.InvoiceStatus> status,
            @RequestParam(required = false) UUID contactId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
            invoiceService.getAllInvoices(pageable, search, status, contactId, startDate, endDate)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Invoice>> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Invoice>> createInvoice(@RequestBody @Valid Invoice invoice) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.createInvoice(invoice)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Invoice>> updateInvoice(@PathVariable UUID id, @RequestBody @Valid Invoice invoice) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.updateInvoice(id, invoice)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Invoice>> approveInvoice(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.approveInvoice(id)));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Invoice>> payInvoice(
            @PathVariable UUID id,
            @RequestBody @Valid com.accounting.platform.invoice.dto.PaymentRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.payInvoice(id, request)));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable UUID id) {
        Invoice invoice = invoiceService.getInvoiceById(id);
        byte[] pdf = pdfService.generateInvoicePdf(invoice);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoice-" + invoice.getInvoiceNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable UUID id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
