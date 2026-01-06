package com.accounting.platform.recurring.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "recurring_templates")
public class RecurringTemplate extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency;

    @Column(name = "next_run_date", nullable = false)
    private LocalDate nextRunDate;

    // We store the structure of the Journal Entry to be created
    // Using Map for flexibility, but ideally this would be a specific DTO class
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_data", columnDefinition = "jsonb")
    private Map<String, Object> templateData;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "last_run_date")
    private LocalDate lastRunDate;
}
