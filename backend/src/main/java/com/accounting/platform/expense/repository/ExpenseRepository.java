package com.accounting.platform.expense.repository;

import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.entity.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Expense> {
    Page<Expense> findByStatus(ExpenseStatus status, Pageable pageable);

    Page<Expense> findByVendorId(UUID vendorId, Pageable pageable);

    Page<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(e.totalAmount), 0) FROM Expense e WHERE e.status IN :statuses")
    java.math.BigDecimal sumTotalAmountByStatusIn(@org.springframework.web.bind.annotation.RequestParam("statuses") java.util.Collection<ExpenseStatus> statuses);

}
