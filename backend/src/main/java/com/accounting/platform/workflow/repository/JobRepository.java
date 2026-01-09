package com.accounting.platform.workflow.repository;

import com.accounting.platform.workflow.entity.Job;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    @EntityGraph(attributePaths = {"workflow", "workflow.stages", "currentStage", "contact"})
    Optional<Job> findById(UUID id);

    @EntityGraph(attributePaths = {"workflow", "workflow.stages", "currentStage", "contact"})
    List<Job> findByWorkflowId(UUID workflowId);

    List<Job> findByCurrentStageId(UUID stageId);

    List<Job> findByDueDateBetween(LocalDate startDate, LocalDate endDate);

    @EntityGraph(attributePaths = {"workflow", "workflow.stages", "currentStage", "contact"})
    List<Job> findByContactId(UUID contactId);
}
