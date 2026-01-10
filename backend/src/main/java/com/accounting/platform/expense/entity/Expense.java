package com.accounting.platform.expense.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.accounting.platform.contact.entity.Contact;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "expenses")
public class Expense extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Contact vendor;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status = ExpenseStatus.DRAFT;

    @Column(nullable = false)
    private String currency;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseLine> lines = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String notes;

    public void addLine(ExpenseLine line) {
        lines.add(line);
        line.setExpense(this);
        calculateTotal();
    }

    public void removeLine(ExpenseLine line) {
        lines.remove(line);
        line.setExpense(null);
        calculateTotal();
    }

    public void calculateTotal() {
        this.totalAmount = lines.stream()
                .map(ExpenseLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void setVendorId(UUID vendorId) {
        if (vendorId != null) {
            this.vendor = new Contact();
            this.vendor.setId(vendorId);
        }
    }
}
