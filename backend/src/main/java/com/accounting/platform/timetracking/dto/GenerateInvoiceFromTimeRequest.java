package com.accounting.platform.timetracking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateInvoiceFromTimeRequest {

    @NotNull(message = "Contact ID is required")
    private UUID contactId;

    private List<UUID> timeEntryIds;

    private String invoiceNotes;
}
