package com.accounting.platform.settings.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "fiscal_periods")
public class FiscalPeriod extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FiscalPeriodStatus status;

    @Column(name = "closed_at")
    private LocalDate closedAt;

    @Column(name = "closed_by")
    private String closedBy;
}
