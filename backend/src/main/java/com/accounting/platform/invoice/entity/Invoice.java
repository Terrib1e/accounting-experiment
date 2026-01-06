package com.accounting.platform.invoice.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.accounting.platform.contact.entity.Contact;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "invoices")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Invoice extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "invoice_number", nullable = false, unique = true)
    private String invoiceNumber;

    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(nullable = false)
    private String currency;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "amount_paid", nullable = false, precision = 19, scale = 4)
    private BigDecimal amountPaid = BigDecimal.ZERO;


    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceLine> lines = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String notes;

    public void addLine(InvoiceLine line) {
        lines.add(line);
        line.setInvoice(this);
        calculateTotal();
    }

    public void removeLine(InvoiceLine line) {
        lines.remove(line);
        line.setInvoice(null);
        calculateTotal();
    }

    public void calculateTotal() {
        this.totalAmount = lines.stream()
                .map(line -> line.getAmount().add(line.getTaxAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getAmountDue() {
        // TODO: Subtract payments once Payment entity is linked or amountPaid field exists
        return totalAmount;
    }
}
