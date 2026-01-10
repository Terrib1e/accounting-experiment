package com.accounting.platform.timetracking.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.security.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Stores default billable rates for users, optionally per-client.
 * Used to auto-populate rates when creating time entries.
 */
@Getter
@Setter
@Entity
@Table(name = "billable_rates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "contact_id", "effective_date"})
})
public class BillableRate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact; // Null means default rate for all clients

    @Column(name = "hourly_rate", nullable = false, precision = 19, scale = 4)
    private BigDecimal hourlyRate;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private Boolean active = true;
}
