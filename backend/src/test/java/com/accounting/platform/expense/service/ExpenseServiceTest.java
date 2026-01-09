package com.accounting.platform.expense.service;

import com.accounting.platform.account.repository.AccountRepository;
import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.expense.entity.Expense;
import com.accounting.platform.expense.entity.ExpenseStatus;
import com.accounting.platform.expense.repository.ExpenseRepository;
import com.accounting.platform.journal.service.JournalEntryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private JournalEntryService journalEntryService;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private ContactRepository contactRepository;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void createExpense_Success() {
        // Arrange
        UUID vendorId = UUID.randomUUID();
        Contact vendor = new Contact();
        vendor.setId(vendorId);
        vendor.setName("Test Vendor");

        Expense expense = new Expense();
        expense.setVendor(vendor);
        expense.setTotalAmount(new java.math.BigDecimal("100.00"));

        when(contactRepository.findById(vendorId)).thenReturn(Optional.of(vendor));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> {
            Expense e = invocation.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });

        // Act
        Expense result = expenseService.createExpense(expense);

        // Assert
        assertNotNull(result.getId());
        assertEquals(ExpenseStatus.DRAFT, result.getStatus());
        assertEquals(vendor, result.getVendor());
        verify(contactRepository).findById(vendorId);
        verify(expenseRepository).save(any(Expense.class));
        verify(auditService).logCreate(eq("Expense"), any(), any());
    }

    @Test
    void createExpense_MissingVendor() {
        // Arrange
        Expense expense = new Expense();
        // Vendor is null

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            expenseService.createExpense(expense);
        });

        assertEquals("Vendor is required", exception.getMessage());
        verify(expenseRepository, never()).save(any());
    }
}
