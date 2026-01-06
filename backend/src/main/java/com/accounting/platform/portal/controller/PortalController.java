package com.accounting.platform.portal.controller;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.repository.InvoiceRepository;
import com.accounting.platform.security.entity.User;
import com.accounting.platform.security.repository.UserRepository;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.repository.JobRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import com.accounting.platform.portal.dto.ClientDashboardDto;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portal")
@RequiredArgsConstructor
@Tag(name = "Client Portal", description = "Endpoints for external clients")
@PreAuthorize("hasRole('CLIENT')")
public class PortalController {

    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;
    private final JobRepository jobRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Get client dashboard summary")
    public ResponseEntity<ClientDashboardDto> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        Contact contact = getContactForUser(userDetails.getUsername());
        if (contact == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Invoice> invoices = invoiceRepository.findByContactId(contact.getId());

        List<Invoice> outstandingInvoices = invoices.stream()
                .filter(i -> i.getStatus().name().equals("SENT") || i.getStatus().name().equals("PARTIALLY_PAID") || i.getStatus().name().equals("OVERDUE"))
                .toList();

        long outstandingCount = outstandingInvoices.size();

        java.math.BigDecimal totalOutstandingAmount = outstandingInvoices.stream()
                .map(Invoice::getAmountDue)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        List<Job> jobs = jobRepository.findByContactId(contact.getId());
        long activeJobs = jobs.stream()
                .filter(j -> !j.getCurrentStage().isFinal())
                .count();

        // Placeholder for documents until Document module is ready
        long unreadDocuments = 0;

        return ResponseEntity.ok(ClientDashboardDto.builder()
                .outstandingInvoices(outstandingCount)
                .totalOutstandingAmount(totalOutstandingAmount)
                .activeJobs(activeJobs)
                .unreadDocuments(unreadDocuments)
                .contactName(contact.getName())
                .build());
    }

    @GetMapping("/invoices")
    @Operation(summary = "Get client's invoices")
    public ResponseEntity<List<Invoice>> getMyInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        Contact contact = getContactForUser(userDetails.getUsername());
        if (contact == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(invoiceRepository.findByContactId(contact.getId()));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Get client's active jobs")
    public ResponseEntity<List<Job>> getMyJobs(@AuthenticationPrincipal UserDetails userDetails) {
        Contact contact = getContactForUser(userDetails.getUsername());
        if (contact == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(jobRepository.findByContactId(contact.getId()));
    }

    private Contact getContactForUser(String email) {
        return userRepository.findByEmail(email)
                .map(User::getContact)
                .orElse(null);
    }
}
