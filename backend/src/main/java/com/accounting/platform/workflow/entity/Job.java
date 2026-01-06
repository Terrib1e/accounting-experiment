package com.accounting.platform.workflow.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.accounting.platform.contact.entity.Contact;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "jobs")
@Getter
@Setter
public class Job extends BaseEntity {

    @Column(nullable = false)
    private String name; // e.g., "John Doe - 2024 Tax Return"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private Workflow workflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_stage_id", nullable = false)
    private WorkflowStage currentStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact; // The Client

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assignee_id")
    private String assigneeId; // User ID

    // Future: recurring schedule reference
}
