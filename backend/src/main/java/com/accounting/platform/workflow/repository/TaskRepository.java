package com.accounting.platform.workflow.repository;

import com.accounting.platform.workflow.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByJobId(UUID jobId);

    List<Task> findByAssigneeId(String assigneeId);

    List<Task> findByJobIdAndIsCompletedFalse(UUID jobId);
}
