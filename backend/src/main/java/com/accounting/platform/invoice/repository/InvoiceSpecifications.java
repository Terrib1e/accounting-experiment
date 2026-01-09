package com.accounting.platform.invoice.repository;

import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.entity.InvoiceStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Collection;
import java.util.UUID;

public class InvoiceSpecifications {

    public static Specification<Invoice> hasStatus(Collection<InvoiceStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("status").in(statuses);
        };
    }

    public static Specification<Invoice> hasContactId(UUID contactId) {
        return (root, query, cb) -> {
            if (contactId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("contact").get("id"), contactId);
        };
    }

    public static Specification<Invoice> issueDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) {
                return cb.conjunction();
            }
            if (startDate != null && endDate != null) {
                return cb.between(root.get("issueDate"), startDate, endDate);
            }
            if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("issueDate"), startDate);
            }
            return cb.lessThanOrEqualTo(root.get("issueDate"), endDate);
        };
    }

    public static Specification<Invoice> searchText(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + searchTerm.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("invoiceNumber")), pattern),
                cb.like(cb.lower(root.get("reference")), pattern),
                cb.like(cb.lower(root.get("contact").get("name")), pattern)
            );
        };
    }

    public static Specification<Invoice> buildSpec(
            String search,
            Collection<InvoiceStatus> statuses,
            UUID contactId,
            LocalDate startDate,
            LocalDate endDate) {

        return Specification.where(searchText(search))
                .and(hasStatus(statuses))
                .and(hasContactId(contactId))
                .and(issueDateBetween(startDate, endDate));
    }
}
