package com.accounting.platform.workflow.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflows")
@Getter
@Setter
public class Workflow extends BaseEntity {

    @Column(nullable = false)
    private String name; // e.g., "1040 Tax Return", "Monthly Bookkeeping"

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkflowStage> stages = new ArrayList<>();

    // Helper to add stage
    public void addStage(WorkflowStage stage) {
        stages.add(stage);
        stage.setWorkflow(this);
    }
}
