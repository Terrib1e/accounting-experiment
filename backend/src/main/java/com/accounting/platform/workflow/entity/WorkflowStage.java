package com.accounting.platform.workflow.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "workflow_stages")
@Getter
@Setter
public class WorkflowStage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private Workflow workflow;

    @Column(nullable = false)
    private String name; // e.g., "Data Collection", "Preparation", "Review"

    @Column(nullable = false)
    private Integer orderIndex; // For ordering columns in Kanban board

    @Column(nullable = false)
    private boolean isInitial; // Default stage when job starts

    @Column(nullable = false)
    private boolean isFinal; // Job is considered complete
}
