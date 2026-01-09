package com.accounting.platform.workflow.repository;

import com.accounting.platform.workflow.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {

    @Query("SELECT w FROM Workflow w LEFT JOIN FETCH w.stages WHERE w.id = :id")
    Optional<Workflow> findByIdWithStages(UUID id);
}
