package com.accounting.platform.invoice.repository;

import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    Page<Invoice> findByContactId(UUID contactId, Pageable pageable);

    Page<Invoice> findByIssueDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    boolean existsByInvoiceNumber(String invoiceNumber);

    java.util.List<Invoice> findByContactId(UUID contactId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status IN :statuses")
    java.math.BigDecimal sumTotalAmountByStatusIn(@org.springframework.web.bind.annotation.RequestParam("statuses") java.util.Collection<InvoiceStatus> statuses);

}
