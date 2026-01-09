package com.accounting.platform.expense.repository;

import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.entity.ExpenseStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Collection;
import java.util.UUID;

public class ExpenseSpecifications {

    public static Specification<Expense> hasStatus(Collection<ExpenseStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("status").in(statuses);
        };
    }

    public static Specification<Expense> hasVendorId(UUID vendorId) {
        return (root, query, cb) -> {
            if (vendorId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("vendor").get("id"), vendorId);
        };
    }

    public static Specification<Expense> dateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) {
                return cb.conjunction();
            }
            if (startDate != null && endDate != null) {
                return cb.between(root.get("date"), startDate, endDate);
            }
            if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("date"), startDate);
            }
            return cb.lessThanOrEqualTo(root.get("date"), endDate);
        };
    }

    public static Specification<Expense> searchText(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + searchTerm.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("referenceNumber")), pattern),
                cb.like(cb.lower(root.get("notes")), pattern),
                cb.like(cb.lower(root.get("vendor").get("name")), pattern)
            );
        };
    }

    public static Specification<Expense> buildSpec(
            String search,
            Collection<ExpenseStatus> statuses,
            UUID vendorId,
            LocalDate startDate,
            LocalDate endDate) {

        return Specification.where(searchText(search))
                .and(hasStatus(statuses))
                .and(hasVendorId(vendorId))
                .and(dateBetween(startDate, endDate));
    }
}
