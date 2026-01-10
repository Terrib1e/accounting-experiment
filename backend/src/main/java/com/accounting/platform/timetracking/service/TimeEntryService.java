package com.accounting.platform.timetracking.service;

import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.security.entity.User;
import com.accounting.platform.security.repository.UserRepository;
import com.accounting.platform.timetracking.dto.*;
import com.accounting.platform.timetracking.entity.TimeEntry;
import com.accounting.platform.timetracking.entity.TimeEntryStatus;
import com.accounting.platform.timetracking.mapper.TimeEntryMapper;
import com.accounting.platform.timetracking.repository.BillableRateRepository;
import com.accounting.platform.timetracking.repository.TimeEntryRepository;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.repository.JobRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final BillableRateRepository billableRateRepository;
    private final JobRepository jobRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final TimeEntryMapper timeEntryMapper;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<TimeEntryDto> getAllTimeEntries() {
        return timeEntryMapper.toDtoList(timeEntryRepository.findAllWithRelations());
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDto> getTimeEntriesForCurrentUser() {
        UUID userId = getCurrentUserId();
        return timeEntryMapper.toDtoList(timeEntryRepository.findByUserIdOrderByDateDescStartTimeDesc(userId));
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDto> getTimeEntriesByDateRange(LocalDate startDate, LocalDate endDate) {
        UUID userId = getCurrentUserId();
        return timeEntryMapper.toDtoList(timeEntryRepository.findByUserIdAndDateRange(userId, startDate, endDate));
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDto> getTimeEntriesForJob(UUID jobId) {
        return timeEntryMapper.toDtoList(timeEntryRepository.findByJobIdOrderByDateDescStartTimeDesc(jobId));
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDto> getTimeEntriesForContact(UUID contactId) {
        return timeEntryMapper.toDtoList(timeEntryRepository.findByContactIdOrderByDateDescStartTimeDesc(contactId));
    }

    @Transactional(readOnly = true)
    public TimeEntryDto getTimeEntry(UUID id) {
        TimeEntry entry = timeEntryRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new EntityNotFoundException("Time entry not found: " + id));
        return timeEntryMapper.toDto(entry);
    }

    @Transactional
    public TimeEntryDto createTimeEntry(CreateTimeEntryRequest request) {
        User currentUser = getCurrentUser();

        TimeEntry entry = new TimeEntry();
        entry.setDescription(request.getDescription());
        entry.setDate(request.getDate());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setUser(currentUser);
        entry.setBillable(request.getBillable() != null ? request.getBillable() : true);

        // Calculate duration
        if (request.getDurationMinutes() != null) {
            entry.setDurationMinutes(request.getDurationMinutes());
        } else if (request.getStartTime() != null && request.getEndTime() != null) {
            long minutes = ChronoUnit.MINUTES.between(request.getStartTime(), request.getEndTime());
            entry.setDurationMinutes((int) minutes);
        } else {
            throw new IllegalArgumentException("Either durationMinutes or start/end time must be provided");
        }

        // Link to job if provided
        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new EntityNotFoundException("Job not found: " + request.getJobId()));
            entry.setJob(job);
            // Set contact from job if not explicitly provided
            if (request.getContactId() == null && job.getContact() != null) {
                entry.setContact(job.getContact());
            }
        }

        // Link to contact if provided
        if (request.getContactId() != null) {
            Contact contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + request.getContactId()));
            entry.setContact(contact);
        }

        // Set billable rate
        if (request.getBillableRate() != null) {
            entry.setBillableRate(request.getBillableRate());
        } else {
            entry.setBillableRate(findEffectiveRate(currentUser.getId(), entry.getContact() != null ? entry.getContact().getId() : null, entry.getDate()));
        }

        TimeEntry saved = timeEntryRepository.save(entry);
        auditService.logCreate("TimeEntry", saved.getId(), saved);
        log.info("Created time entry: {} for user {}", saved.getId(), currentUser.getEmail());

        return timeEntryMapper.toDto(saved);
    }

    @Transactional
    public TimeEntryDto updateTimeEntry(UUID id, CreateTimeEntryRequest request) {
        TimeEntry entry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Time entry not found: " + id));

        if (entry.getBilled()) {
            throw new IllegalStateException("Cannot edit a billed time entry");
        }

        entry.setDescription(request.getDescription());
        entry.setDate(request.getDate());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setBillable(request.getBillable() != null ? request.getBillable() : true);

        if (request.getDurationMinutes() != null) {
            entry.setDurationMinutes(request.getDurationMinutes());
        } else if (request.getStartTime() != null && request.getEndTime() != null) {
            long minutes = ChronoUnit.MINUTES.between(request.getStartTime(), request.getEndTime());
            entry.setDurationMinutes((int) minutes);
        }

        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new EntityNotFoundException("Job not found: " + request.getJobId()));
            entry.setJob(job);
        } else {
            entry.setJob(null);
        }

        if (request.getContactId() != null) {
            Contact contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + request.getContactId()));
            entry.setContact(contact);
        }

        if (request.getBillableRate() != null) {
            entry.setBillableRate(request.getBillableRate());
        }

        TimeEntry saved = timeEntryRepository.save(entry);
        auditService.logUpdate("TimeEntry", saved.getId(), entry, saved);

        return timeEntryMapper.toDto(saved);
    }

    @Transactional
    public void deleteTimeEntry(UUID id) {
        TimeEntry entry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Time entry not found: " + id));

        if (entry.getBilled()) {
            throw new IllegalStateException("Cannot delete a billed time entry");
        }

        timeEntryRepository.delete(entry);
        auditService.logDelete("TimeEntry", id, entry);
        log.info("Deleted time entry: {}", id);
    }

    @Transactional
    public TimeEntryDto startTimer(TimerRequest request) {
        User currentUser = getCurrentUser();

        // Stop any existing timer
        Optional<TimeEntry> existingTimer = timeEntryRepository.findByUserIdAndTimerRunningTrue(currentUser.getId());
        if (existingTimer.isPresent()) {
            stopTimerInternal(existingTimer.get());
        }

        TimeEntry entry = new TimeEntry();
        entry.setDescription(request.getDescription());
        entry.setDate(LocalDate.now());
        entry.setStartTime(LocalTime.now());
        entry.setUser(currentUser);
        entry.setTimerRunning(true);
        entry.setTimerStartedAt(Instant.now());
        entry.setDurationMinutes(0);
        entry.setBillable(true);

        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new EntityNotFoundException("Job not found: " + request.getJobId()));
            entry.setJob(job);
            if (job.getContact() != null) {
                entry.setContact(job.getContact());
            }
        }

        if (request.getContactId() != null) {
            Contact contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + request.getContactId()));
            entry.setContact(contact);
        }

        entry.setBillableRate(findEffectiveRate(currentUser.getId(),
                entry.getContact() != null ? entry.getContact().getId() : null, entry.getDate()));

        TimeEntry saved = timeEntryRepository.save(entry);
        log.info("Timer started for user {}: {}", currentUser.getEmail(), saved.getId());

        return timeEntryMapper.toDto(saved);
    }

    @Transactional
    public TimeEntryDto stopTimer() {
        User currentUser = getCurrentUser();

        TimeEntry entry = timeEntryRepository.findByUserIdAndTimerRunningTrue(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("No running timer found"));

        stopTimerInternal(entry);
        TimeEntry saved = timeEntryRepository.save(entry);
        auditService.logCreate("TimeEntry", saved.getId(), saved);
        log.info("Timer stopped for user {}: {} ({} minutes)", currentUser.getEmail(), saved.getId(), saved.getDurationMinutes());

        return timeEntryMapper.toDto(saved);
    }

    private void stopTimerInternal(TimeEntry entry) {
        entry.setTimerRunning(false);
        entry.setEndTime(LocalTime.now());

        if (entry.getTimerStartedAt() != null) {
            long seconds = ChronoUnit.SECONDS.between(entry.getTimerStartedAt(), Instant.now());
            int minutes = (int) Math.ceil(seconds / 60.0);
            entry.setDurationMinutes(Math.max(1, minutes)); // Minimum 1 minute
        }
        entry.setTimerStartedAt(null);
    }

    @Transactional(readOnly = true)
    public TimeEntryDto getRunningTimer() {
        UUID userId = getCurrentUserId();
        return timeEntryRepository.findByUserIdAndTimerRunningTrue(userId)
                .map(timeEntryMapper::toDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public TimeEntrySummaryDto getSummary() {
        UUID userId = getCurrentUserId();
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate monthStart = today.withDayOfMonth(1);

        Integer todayMinutes = timeEntryRepository.sumDurationByUserIdAndDateRange(userId, today, today);
        Integer weekMinutes = timeEntryRepository.sumDurationByUserIdAndDateRange(userId, weekStart, today);
        Integer monthMinutes = timeEntryRepository.sumDurationByUserIdAndDateRange(userId, monthStart, today);

        BigDecimal weekBillable = timeEntryRepository.sumBillableAmountByUserIdAndDateRange(userId, weekStart, today);
        BigDecimal monthBillable = timeEntryRepository.sumBillableAmountByUserIdAndDateRange(userId, monthStart, today);

        Optional<TimeEntry> runningTimer = timeEntryRepository.findByUserIdAndTimerRunningTrue(userId);

        return TimeEntrySummaryDto.builder()
                .totalMinutesToday(todayMinutes != null ? todayMinutes : 0)
                .totalMinutesThisWeek(weekMinutes != null ? weekMinutes : 0)
                .totalMinutesThisMonth(monthMinutes != null ? monthMinutes : 0)
                .billableAmountThisWeek(weekBillable != null ? weekBillable : BigDecimal.ZERO)
                .billableAmountThisMonth(monthBillable != null ? monthBillable : BigDecimal.ZERO)
                .hasRunningTimer(runningTimer.isPresent())
                .runningTimer(runningTimer.map(timeEntryMapper::toDto).orElse(null))
                .build();
    }

    @Transactional
    public void approveTimeEntry(UUID id) {
        TimeEntry entry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Time entry not found: " + id));

        entry.setStatus(TimeEntryStatus.APPROVED);
        timeEntryRepository.save(entry);
        log.info("Time entry approved: {}", id);
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDto> getUnbilledForContact(UUID contactId) {
        return timeEntryMapper.toDtoList(timeEntryRepository.findUnbilledApprovedByContactId(contactId));
    }

    private BigDecimal findEffectiveRate(UUID userId, UUID contactId, LocalDate date) {
        // First try to find a client-specific rate
        if (contactId != null) {
            Optional<com.accounting.platform.timetracking.entity.BillableRate> clientRate =
                    billableRateRepository.findEffectiveRateForUserAndContact(userId, contactId, date);
            if (clientRate.isPresent()) {
                return clientRate.get().getHourlyRate();
            }
        }

        // Fall back to default rate for user
        return billableRateRepository.findDefaultEffectiveRateForUser(userId, date)
                .map(r -> r.getHourlyRate())
                .orElse(BigDecimal.valueOf(100)); // Default rate if none configured
    }

    private UUID getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"))
                .getId();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));
    }
}
