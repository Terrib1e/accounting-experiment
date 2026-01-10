package com.accounting.platform.timetracking.repository;

import com.accounting.platform.timetracking.entity.TimeEntry;
import com.accounting.platform.timetracking.entity.TimeEntryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    List<TimeEntry> findByUserIdOrderByDateDescStartTimeDesc(UUID userId);

    List<TimeEntry> findByJobIdOrderByDateDescStartTimeDesc(UUID jobId);

    List<TimeEntry> findByContactIdOrderByDateDescStartTimeDesc(UUID contactId);

    @Query("SELECT te FROM TimeEntry te WHERE te.user.id = :userId AND te.date BETWEEN :startDate AND :endDate ORDER BY te.date DESC, te.startTime DESC")
    List<TimeEntry> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT te FROM TimeEntry te WHERE te.contact.id = :contactId AND te.billable = true AND te.billed = false AND te.status = 'APPROVED' ORDER BY te.date ASC")
    List<TimeEntry> findUnbilledApprovedByContactId(@Param("contactId") UUID contactId);

    @Query("SELECT te FROM TimeEntry te WHERE te.job.id = :jobId AND te.billable = true AND te.billed = false ORDER BY te.date ASC")
    List<TimeEntry> findUnbilledByJobId(@Param("jobId") UUID jobId);

    Optional<TimeEntry> findByUserIdAndTimerRunningTrue(UUID userId);

    @Query("SELECT te FROM TimeEntry te WHERE te.status = :status ORDER BY te.date DESC")
    List<TimeEntry> findByStatus(@Param("status") TimeEntryStatus status);

    @Query("SELECT SUM(te.durationMinutes) FROM TimeEntry te WHERE te.user.id = :userId AND te.date BETWEEN :startDate AND :endDate")
    Integer sumDurationByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT SUM(te.billableAmount) FROM TimeEntry te WHERE te.user.id = :userId AND te.date BETWEEN :startDate AND :endDate AND te.billable = true")
    java.math.BigDecimal sumBillableAmountByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT te FROM TimeEntry te LEFT JOIN FETCH te.job LEFT JOIN FETCH te.contact LEFT JOIN FETCH te.user WHERE te.id = :id")
    Optional<TimeEntry> findByIdWithRelations(@Param("id") UUID id);

    @Query("SELECT te FROM TimeEntry te LEFT JOIN FETCH te.job LEFT JOIN FETCH te.contact ORDER BY te.date DESC, te.startTime DESC")
    List<TimeEntry> findAllWithRelations();
}
