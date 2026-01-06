package com.accounting.platform.recurring.repository;

import com.accounting.platform.recurring.entity.RecurringTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecurringTemplateRepository extends JpaRepository<RecurringTemplate, UUID> {

    @Query("SELECT rt FROM RecurringTemplate rt WHERE rt.active = true AND rt.nextRunDate <= :date")
    List<RecurringTemplate> findDueTemplates(LocalDate date);
}
