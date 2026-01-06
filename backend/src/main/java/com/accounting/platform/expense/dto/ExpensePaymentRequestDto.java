package com.accounting.platform.expense.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ExpensePaymentRequestDto {
    @NotNull(message = "Bank Account ID is required")
    private UUID bankAccountId;

    @NotNull(message = "Payment Date is required")
    private LocalDate paymentDate;
}
