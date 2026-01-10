package com.accounting.platform.timetracking.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.timetracking.dto.*;
import com.accounting.platform.timetracking.service.TimeEntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/time-entries")
@RequiredArgsConstructor
@Tag(name = "Time Tracking", description = "Time entry management and timer operations")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    @GetMapping
    @Operation(summary = "Get all time entries", description = "Returns all time entries for current user with filters")
    public ResponseEntity<ApiResponse<List<TimeEntryDto>>> getAllTimeEntries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<TimeEntryDto> entries;
        if (startDate != null && endDate != null) {
            entries = timeEntryService.getTimeEntriesByDateRange(startDate, endDate);
        } else {
            entries = timeEntryService.getTimeEntriesForCurrentUser();
        }

        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all time entries (admin)", description = "Returns all time entries across all users")
    public ResponseEntity<ApiResponse<List<TimeEntryDto>>> getAllTimeEntriesAdmin() {
        return ResponseEntity.ok(ApiResponse.success(timeEntryService.getAllTimeEntries()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get time entry by ID")
    public ResponseEntity<ApiResponse<TimeEntryDto>> getTimeEntry(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(timeEntryService.getTimeEntry(id)));
    }

    @GetMapping("/job/{jobId}")
    @Operation(summary = "Get time entries for a job")
    public ResponseEntity<ApiResponse<List<TimeEntryDto>>> getTimeEntriesForJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(ApiResponse.success(timeEntryService.getTimeEntriesForJob(jobId)));
    }

    @GetMapping("/contact/{contactId}")
    @Operation(summary = "Get time entries for a contact/client")
    public ResponseEntity<ApiResponse<List<TimeEntryDto>>> getTimeEntriesForContact(@PathVariable UUID contactId) {
        return ResponseEntity.ok(ApiResponse.success(timeEntryService.getTimeEntriesForContact(contactId)));
    }

    @GetMapping("/contact/{contactId}/unbilled")
    @Operation(summary = "Get unbilled approved time entries for a contact")
    public ResponseEntity<ApiResponse<List<TimeEntryDto>>> getUnbilledForContact(@PathVariable UUID contactId) {
        return ResponseEntity.ok(ApiResponse.success(timeEntryService.getUnbilledForContact(contactId)));
    }

    @PostMapping
    @Operation(summary = "Create a time entry", description = "Create a manual time entry")
    public ResponseEntity<ApiResponse<TimeEntryDto>> createTimeEntry(@Valid @RequestBody CreateTimeEntryRequest request) {
        TimeEntryDto created = timeEntryService.createTimeEntry(request);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a time entry")
    public ResponseEntity<ApiResponse<TimeEntryDto>> updateTimeEntry(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTimeEntryRequest request) {
        TimeEntryDto updated = timeEntryService.updateTimeEntry(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a time entry")
    public ResponseEntity<ApiResponse<Void>> deleteTimeEntry(@PathVariable UUID id) {
        timeEntryService.deleteTimeEntry(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a time entry for billing")
    public ResponseEntity<ApiResponse<Void>> approveTimeEntry(@PathVariable UUID id) {
        timeEntryService.approveTimeEntry(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Timer Operations

    @PostMapping("/timer/start")
    @Operation(summary = "Start a timer", description = "Start tracking time for a task. Stops any existing timer.")
    public ResponseEntity<ApiResponse<TimeEntryDto>> startTimer(@Valid @RequestBody TimerRequest request) {
        TimeEntryDto entry = timeEntryService.startTimer(request);
        return ResponseEntity.ok(ApiResponse.success(entry));
    }

    @PostMapping("/timer/stop")
    @Operation(summary = "Stop the running timer")
    public ResponseEntity<ApiResponse<TimeEntryDto>> stopTimer() {
        TimeEntryDto entry = timeEntryService.stopTimer();
        return ResponseEntity.ok(ApiResponse.success(entry));
    }

    @GetMapping("/timer/current")
    @Operation(summary = "Get the currently running timer", description = "Returns null if no timer is running")
    public ResponseEntity<ApiResponse<TimeEntryDto>> getCurrentTimer() {
        TimeEntryDto timer = timeEntryService.getRunningTimer();
        return ResponseEntity.ok(ApiResponse.success(timer));
    }

    // Summary

    @GetMapping("/summary")
    @Operation(summary = "Get time tracking summary", description = "Returns summary stats for dashboard")
    public ResponseEntity<ApiResponse<TimeEntrySummaryDto>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(timeEntryService.getSummary()));
    }
}
