package com.accounting.platform.invoice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PaymentRequestDto {
    @NotNull(message = "Bank Account ID is required")
    private UUID bankAccountId;

    @NotNull(message = "Payment Date is required")
    private LocalDate paymentDate;
}
