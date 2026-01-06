package com.accounting.platform.journal.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.service.JournalEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/journal-entries")
@RequiredArgsConstructor
public class JournalEntryController {

    private final JournalEntryService journalEntryService;
    private final com.accounting.platform.journal.mapper.JournalEntryMapper journalEntryMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<com.accounting.platform.journal.dto.JournalEntryDto>>> getAllEntries(Pageable pageable) {
        Page<com.accounting.platform.journal.dto.JournalEntryDto> page = journalEntryService.getAllEntryDtos(pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<com.accounting.platform.journal.dto.JournalEntryDto>> getEntryById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(journalEntryService.getEntryDtoById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<com.accounting.platform.journal.dto.JournalEntryDto>> createEntry(@RequestBody @Valid com.accounting.platform.journal.dto.JournalEntryDto dto) {
        return ResponseEntity.ok(ApiResponse.success(journalEntryService.createEntryDto(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<com.accounting.platform.journal.dto.JournalEntryDto>> updateEntry(@PathVariable UUID id, @RequestBody @Valid com.accounting.platform.journal.dto.JournalEntryDto dto) {
        return ResponseEntity.ok(ApiResponse.success(journalEntryService.updateEntryDto(id, dto)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<com.accounting.platform.journal.dto.JournalEntryDto>> approveEntry(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(journalEntryService.approveEntryDto(id)));
    }

    @PostMapping("/{id}/post")
    public ResponseEntity<ApiResponse<com.accounting.platform.journal.dto.JournalEntryDto>> postEntry(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(journalEntryService.postEntryDto(id)));
    }

    @PostMapping("/{id}/void")
    public ResponseEntity<ApiResponse<com.accounting.platform.journal.dto.JournalEntryDto>> voidEntry(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(journalEntryService.voidEntryDto(id)));
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<ApiResponse<com.accounting.platform.journal.dto.JournalEntryDto>> reverseEntry(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(journalEntryService.reverseEntryDto(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(@PathVariable UUID id) {
        journalEntryService.deleteJournalEntry(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
