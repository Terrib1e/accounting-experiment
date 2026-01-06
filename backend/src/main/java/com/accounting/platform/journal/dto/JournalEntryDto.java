package com.accounting.platform.journal.dto;

import com.accounting.platform.journal.entity.JournalEntryStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class JournalEntryDto {
    private UUID id;
    private String entryNumber;
    private LocalDate entryDate;
    private String description;
    private String referenceNumber;
    private JournalEntryStatus status;
    private List<JournalEntryLineDto> lines;

    @Data
    public static class JournalEntryLineDto {
        private UUID id;
        private UUID accountId;
        private String accountName; // Convenience field
        private BigDecimal debit;
        private BigDecimal credit;
        private String description;
    }
}
