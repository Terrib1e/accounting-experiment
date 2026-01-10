package com.accounting.platform.timetracking.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.security.entity.User;
import com.accounting.platform.workflow.entity.Job;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Represents a time entry for tracking billable and non-billable work.
 * Can be linked to a job, contact, and user.
 */
@Getter
@Setter
@Entity
@Table(name = "time_entries")
public class TimeEntry extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "entry_date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 0;

    @Column(nullable = false)
    private Boolean billable = true;

    @Column(name = "billable_rate", precision = 19, scale = 4)
    private BigDecimal billableRate;

    @Column(name = "billable_amount", precision = 19, scale = 4)
    private BigDecimal billableAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeEntryStatus status = TimeEntryStatus.DRAFT;

    @Column(name = "billed")
    private Boolean billed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @Column(name = "timer_running")
    private Boolean timerRunning = false;

    @Column(name = "timer_started_at")
    private java.time.Instant timerStartedAt;

    /**
     * Calculate billable amount based on duration and rate.
     * Called before saving.
     */
    @PrePersist
    @PreUpdate
    public void calculateBillableAmount() {
        if (billable && billableRate != null && durationMinutes != null && durationMinutes > 0) {
            BigDecimal hours = BigDecimal.valueOf(durationMinutes).divide(BigDecimal.valueOf(60), 4, java.math.RoundingMode.HALF_UP);
            this.billableAmount = hours.multiply(billableRate).setScale(2, java.math.RoundingMode.HALF_UP);
        } else {
            this.billableAmount = BigDecimal.ZERO;
        }
    }

    /**
     * Get duration as formatted string (e.g., "2h 30m")
     */
    public String getFormattedDuration() {
        if (durationMinutes == null || durationMinutes == 0) {
            return "0m";
        }
        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;
        if (hours > 0 && minutes > 0) {
            return hours + "h " + minutes + "m";
        } else if (hours > 0) {
            return hours + "h";
        } else {
            return minutes + "m";
        }
    }
}
