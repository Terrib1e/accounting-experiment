# Implementation Plan: Enterprise Accounting Platform

## Overview

This implementation plan breaks down the enterprise accounting platform into incremental tasks, organized by feature domain. Each task builds on previous work, ensuring no orphaned code. The plan follows a backend-first approach for core features, with frontend implementation following API completion.

## Tasks

- [-] 1. Project Setup and Infrastructure
  - [ ] 1.1 Initialize Spring Boot 3.2+ backend project
    - Create Maven/Gradle project with required dependencies (Spring Web, Security, Data JPA, Validation)
    - Configure PostgreSQL 16 connection and Liquibase migrations
    - Set up Redis connection for caching and sessions
    - Configure application profiles (dev, test, prod)
    - _Requirements: 26.1, 31.4_

  - [ ] 1.2 Initialize Angular 18+ frontend project
    - Create Angular project with standalone components
    - Configure Angular Material and TailwindCSS
    - Set up NgRx store structure
    - Configure environment files and proxy for API
    - _Requirements: 30.3_

  - [ ] 1.3 Set up base entity classes and common utilities
    - Create BaseEntity with UUID, audit fields, and version
    - Implement EncryptedStringConverter for field-level encryption
    - Create common DTOs (ErrorResponse, Page, ApiResponse)
    - Set up MapStruct configuration
    - _Requirements: 28.1, 28.3_

- [ ] 2. Authentication and Security Module
  - [ ] 2.1 Implement User entity and repository
    - Create User entity with all fields (email, passwordHash, role, permissions, MFA fields, status, lockout fields)
    - Create Organization entity
    - Implement UserRepository with custom queries
    - Create Liquibase migrations for users and organizations tables
    - _Requirements: 1.1, 2.4, 3.1_

  - [ ] 2.2 Implement JWT token provider with RS256
    - Generate RSA key pair for token signing
    - Implement JwtTokenProvider with access and refresh token generation
    - Implement token validation and claims extraction
    - Add refresh token rotation with revocation
    - _Requirements: 2.1, 2.6_

  - [ ]* 2.3 Write property test for JWT token content
    - **Property 16: JWT Token Content and Signing**
    - **Validates: Requirements 2.1, 2.4**

  - [ ] 2.4 Implement user registration service
    - Create RegisterRequest and UserDto
    - Implement password hashing with Argon2id
    - Implement email uniqueness validation
    - Implement password complexity validation
    - Send verification email (mock for now)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.5 Write property tests for registration
    - **Property 15: Password Hash Security**
    - **Property 19: Duplicate Email Rejection**
    - **Validates: Requirements 1.2, 1.4**

  - [ ] 2.6 Implement authentication service with account lockout
    - Create LoginRequest and AuthResponse
    - Implement credential validation
    - Implement failed attempt tracking with exponential backoff
    - Implement account lockout logic
    - _Requirements: 2.1, 2.2, 2.5_

  - [ ]* 2.7 Write property test for account lockout
    - **Property 17: Account Lockout After Failed Attempts**
    - **Validates: Requirements 2.5**

  - [ ] 2.8 Implement MFA service
    - Implement TOTP secret generation and QR code
    - Implement TOTP verification
    - Implement MFA enable/disable
    - Update authentication flow for MFA
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.9 Write property test for MFA verification
    - **Property 18: MFA Verification Requirement**
    - **Validates: Requirements 3.3, 3.4**

  - [ ] 2.10 Implement password reset service
    - Create password reset token generation
    - Implement token validation with 1-hour expiry
    - Implement password update and token invalidation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 2.11 Implement Spring Security configuration
    - Configure JwtAuthenticationFilter
    - Configure role-based access control
    - Implement rate limiting filter
    - Configure CORS and security headers (CSP, X-Frame-Options)
    - Implement CSRF protection
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 28.4, 28.5, 28.6_

  - [ ]* 2.12 Write property test for RBAC
    - **Property 14: Role-Based Access Control**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ]* 2.13 Write property test for rate limiting
    - **Property 30: Rate Limiting Enforcement**
    - **Validates: Requirements 28.4**

  - [ ] 2.14 Implement AuthController endpoints
    - POST /api/v1/auth/register
    - POST /api/v1/auth/login
    - POST /api/v1/auth/refresh
    - POST /api/v1/auth/logout
    - POST /api/v1/auth/mfa/setup
    - POST /api/v1/auth/mfa/verify
    - POST /api/v1/auth/password/forgot
    - POST /api/v1/auth/password/reset
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 3. Checkpoint - Authentication Module Complete
  - Ensure all authentication tests pass
  - Verify JWT generation and validation
  - Verify MFA flow works correctly
  - Ask the user if questions arise

- [ ] 4. Frontend Authentication
  - [ ] 4.1 Implement Angular auth service
    - Create AuthService with login, register, logout, refresh methods
    - Implement MFA setup and verification methods
    - Implement password reset methods
    - Store tokens in localStorage with secure handling
    - _Requirements: 2.1, 3.1, 4.1_

  - [ ] 4.2 Implement HTTP interceptors
    - Create AuthInterceptor to attach JWT to requests
    - Create ErrorInterceptor for global error handling
    - Implement automatic token refresh on 401
    - _Requirements: 2.3_

  - [ ] 4.3 Implement route guards
    - Create AuthGuard for protected routes
    - Create RoleGuard for role-based route protection
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 4.4 Implement auth UI components
    - Create LoginComponent with form validation
    - Create RegisterComponent with password strength indicator
    - Create MfaSetupComponent with QR code display
    - Create MfaVerifyComponent
    - Create PasswordResetComponent
    - _Requirements: 30.3, 30.5_

- [ ] 5. Audit Logging Module
  - [ ] 5.1 Implement AuditLog entity and repository
    - Create AuditLog entity with all fields
    - Create AuditLogRepository (no delete methods)
    - Create Liquibase migration
    - _Requirements: 27.1, 27.3_

  - [ ] 5.2 Implement AuditService
    - Implement logCreate, logUpdate, logDelete methods
    - Capture user, timestamp, IP address, user agent
    - Generate correlation IDs for related operations
    - Implement getAuditTrail method
    - _Requirements: 27.1, 27.2, 27.4, 27.5_

  - [ ]* 5.3 Write property tests for audit logging
    - **Property 23: Audit Log Immutability**
    - **Property 24: Audit Log Completeness**
    - **Validates: Requirements 27.1, 27.2, 27.3, 27.4**

- [ ] 6. Chart of Accounts Module
  - [ ] 6.1 Implement Account entity and repository
    - Create Account entity with all fields including version for optimistic locking
    - Create AccountRepository with custom queries
    - Create Liquibase migration
    - _Requirements: 6.1, 6.3_

  - [ ] 6.2 Implement AccountService
    - Implement CRUD operations
    - Implement account code uniqueness validation per organization
    - Implement account hierarchy (parent/child)
    - Implement account type validation
    - Implement deletion with journal entry line check
    - Implement balance calculation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 6.3 Write property tests for accounts
    - **Property 12: Account Deletion Integrity**
    - **Property 20: Duplicate Account Code Rejection**
    - **Validates: Requirements 6.2, 6.4, 6.5**

  - [ ] 6.4 Implement account import/export
    - Implement CSV/Excel import with validation
    - Implement CSV/Excel export
    - _Requirements: 6.8_

  - [ ] 6.5 Implement AccountController endpoints
    - GET /api/v1/accounts
    - GET /api/v1/accounts/{id}
    - POST /api/v1/accounts
    - PUT /api/v1/accounts/{id}
    - DELETE /api/v1/accounts/{id}
    - GET /api/v1/accounts/tree
    - POST /api/v1/accounts/import
    - GET /api/v1/accounts/export
    - _Requirements: 6.1, 6.8_

- [ ] 7. Fiscal Period Module
  - [ ] 7.1 Implement FiscalPeriod entity and repository
    - Create FiscalPeriod entity
    - Create FiscalPeriodRepository
    - Create Liquibase migration
    - _Requirements: 25.1_

  - [ ] 7.2 Implement FiscalPeriodService
    - Implement period open/close logic
    - Implement isPeriodOpen check for date
    - _Requirements: 25.1, 25.2, 25.3, 25.4_

  - [ ] 7.3 Implement fiscal period endpoints in SettingsController
    - GET /api/v1/settings/fiscal-periods
    - POST /api/v1/settings/fiscal-periods/{id}/close
    - POST /api/v1/settings/fiscal-periods/{id}/open
    - _Requirements: 25.1, 25.2_

- [ ] 8. Journal Entry Module
  - [ ] 8.1 Implement JournalEntry and JournalEntryLine entities
    - Create JournalEntry entity with status workflow fields
    - Create JournalEntryLine entity
    - Create Attachment entity
    - Create Liquibase migrations
    - _Requirements: 7.1, 7.9_

  - [ ] 8.2 Implement JournalEntryService core operations
    - Implement balance validation (debits = credits)
    - Implement entry number generation
    - Implement CRUD operations
    - _Requirements: 7.1, 7.2, 7.8_

  - [ ]* 8.3 Write property test for double-entry balance
    - **Property 1: Double-Entry Balance Invariant**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 8.4 Write property test for unique entry numbers
    - **Property 3: Unique Entry Number Generation**
    - **Validates: Requirements 7.8**

  - [ ] 8.5 Implement journal entry workflow
    - Implement submitForApproval (DRAFT → PENDING_APPROVAL)
    - Implement approve (PENDING_APPROVAL → POSTED with approver)
    - Implement post with fiscal period check
    - Implement void (create reversing entry)
    - Implement reverse
    - _Requirements: 7.3, 7.4, 7.5, 7.10_

  - [ ]* 8.6 Write property tests for workflow
    - **Property 4: Journal Entry Status Workflow**
    - **Property 5: Fiscal Period Posting Restriction**
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.10**

  - [ ] 8.7 Implement journal entry search
    - Implement search by date range
    - Implement search by account
    - Implement search by status
    - _Requirements: 7.6, 7.7_

  - [ ]* 8.8 Write property test for search
    - **Property 2: Journal Entry Search Completeness**
    - **Validates: Requirements 7.6, 7.7**

  - [ ] 8.9 Implement file attachment service
    - Implement file upload with type validation (PDF, JPG, PNG)
    - Implement file size limit (10MB)
    - Implement file download
    - Implement malware scanning (mock for now)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 8.10 Write property tests for attachments
    - **Property 21: File Upload/Download Round-Trip**
    - **Property 22: File Size Limit Enforcement**
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ] 8.11 Implement JournalEntryController endpoints
    - All CRUD and workflow endpoints
    - Attachment upload/download endpoints
    - Audit trail endpoint
    - _Requirements: 7.1, 8.1_

- [ ] 9. Checkpoint - Core Accounting Complete
  - Ensure all journal entry tests pass
  - Verify double-entry validation works
  - Verify workflow transitions work correctly
  - Ask the user if questions arise


- [ ] 10. Contact Management Module
  - [ ] 10.1 Implement Contact entity and repository
    - Create Contact entity with encrypted taxId
    - Create Address value object
    - Create ContactRepository
    - Create Liquibase migration
    - _Requirements: 9.1, 9.2_

  - [ ] 10.2 Implement ContactService
    - Implement CRUD operations
    - Implement contact type handling (CUSTOMER, VENDOR, BOTH)
    - Implement deletion with financial record check
    - Implement credit limit and balance tracking
    - Implement statement generation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 10.3 Write property test for contact deletion
    - **Property 13: Contact Deletion Integrity**
    - **Validates: Requirements 9.4, 9.5**

  - [ ]* 10.4 Write property test for sensitive data encryption
    - **Property 29: Sensitive Data Encryption**
    - **Validates: Requirements 9 (taxId), 14.2, 14.3**

  - [ ] 10.5 Implement ContactController endpoints
    - All CRUD endpoints
    - GET /api/v1/contacts/{id}/transactions
    - GET /api/v1/contacts/{id}/statement
    - _Requirements: 9.1, 9.7_

- [ ] 11. Invoice Module
  - [ ] 11.1 Implement Invoice and InvoiceLine entities
    - Create Invoice entity with all status and amount fields
    - Create InvoiceLine entity
    - Create Liquibase migrations
    - _Requirements: 10.1, 10.7_

  - [ ] 11.2 Implement InvoiceService core operations
    - Implement invoice number generation (configurable format)
    - Implement subtotal calculation (quantity × unitPrice)
    - Implement total calculation (subtotal - discount + tax)
    - Implement CRUD operations
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 11.3 Write property test for invoice calculations
    - **Property 6: Invoice Calculation Correctness**
    - **Validates: Requirements 10.3, 10.4**

  - [ ] 11.4 Implement invoice status management
    - Implement send (DRAFT → SENT)
    - Implement recordPayment with partial payment support
    - Implement void
    - Implement writeOff
    - Implement overdue detection
    - Create journal entry on payment
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ]* 11.5 Write property tests for invoice status
    - **Property 7: Invoice Status Transition Rules**
    - **Property 8: Invoice Payment Tracking**
    - **Validates: Requirements 10.5, 10.6, 11.2, 11.3, 11.5**

  - [ ] 11.6 Implement invoice PDF generation
    - Implement PDF template with all invoice details
    - Support customizable templates
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 11.7 Implement invoice duplicate
    - Create new DRAFT invoice with copied line items
    - _Requirements: 10.8_

  - [ ] 11.8 Implement InvoiceController endpoints
    - All CRUD and status endpoints
    - PDF export endpoint
    - Duplicate endpoint
    - Aging report endpoint
    - _Requirements: 10.1, 11.1, 12.1_

- [ ] 12. Expense Module
  - [ ] 12.1 Implement Expense entity and repository
    - Create Expense entity
    - Create ExpenseRepository
    - Create Liquibase migration
    - _Requirements: 13.1_

  - [ ] 12.2 Implement ExpenseService
    - Implement CRUD operations
    - Implement recurring expense support
    - Implement categorization by account
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ] 12.3 Implement ExpenseController endpoints
    - All CRUD endpoints
    - _Requirements: 13.1_

- [ ] 13. Bank Account and Reconciliation Module
  - [ ] 13.1 Implement BankAccount and BankTransaction entities
    - Create BankAccount entity with encrypted fields
    - Create BankTransaction entity
    - Create Liquibase migrations
    - _Requirements: 14.1, 14.2_

  - [ ] 13.2 Implement BankAccountService
    - Implement CRUD operations
    - Implement account number masking in responses
    - Implement transaction import (CSV)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 13.3 Implement BankReconciliationService
    - Implement transaction matching
    - Implement journal entry creation from transaction
    - Implement transaction exclusion
    - Implement reconciliation completion
    - Maintain reconciliation history
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ]* 13.4 Write property test for reconciliation
    - **Property 25: Bank Reconciliation Status Transitions**
    - **Validates: Requirements 15.2, 15.3, 15.4, 15.5**

  - [ ] 13.5 Implement bank account and reconciliation controllers
    - BankAccountController endpoints
    - BankTransactionController endpoints
    - _Requirements: 14.1, 15.1_

- [ ] 14. Recurring Transactions Module
  - [ ] 14.1 Implement RecurringTemplate entity and repository
    - Create RecurringTemplate entity
    - Create RecurringTemplateRepository
    - Create Liquibase migration
    - _Requirements: 16.1, 16.2_

  - [ ] 14.2 Implement RecurringTemplateService
    - Implement CRUD operations
    - Implement frequency handling (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
    - Implement processRecurringTransactions for scheduled execution
    - Track run count and max runs
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 14.3 Write property test for recurring generation
    - **Property 26: Recurring Transaction Generation**
    - **Validates: Requirements 16.3**

  - [ ] 14.4 Implement RecurringTemplateController endpoints
    - All CRUD endpoints
    - _Requirements: 16.1_

- [ ] 15. Checkpoint - Business Operations Complete
  - Ensure all invoice and expense tests pass
  - Verify bank reconciliation works correctly
  - Verify recurring transactions generate correctly
  - Ask the user if questions arise

- [ ] 16. Financial Reports Module
  - [ ] 16.1 Implement ReportService - Balance Sheet
    - Calculate asset, liability, equity balances as of date
    - Ensure accounting equation (A = L + E)
    - Group by type and subtype
    - Support comparative periods
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [ ]* 16.2 Write property test for balance sheet
    - **Property 9: Accounting Equation Balance**
    - **Validates: Requirements 17.2**

  - [ ] 16.3 Implement ReportService - Income Statement
    - Calculate revenue and expense totals for date range
    - Calculate net income
    - Group by type and subtype
    - Support comparative periods
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ]* 16.4 Write property test for income statement
    - **Property 11: Income Statement Calculation**
    - **Validates: Requirements 18.2**

  - [ ] 16.5 Implement ReportService - Trial Balance
    - Return all accounts with debit/credit balances
    - Ensure total debits = total credits
    - Support as-of-date
    - _Requirements: 19.1, 19.2, 19.3_

  - [ ]* 16.6 Write property test for trial balance
    - **Property 10: Trial Balance Equilibrium**
    - **Validates: Requirements 19.2**

  - [ ] 16.7 Implement ReportService - General Ledger
    - Return journal entry lines for account and date range
    - Calculate running balance
    - Include opening and closing balances
    - _Requirements: 20.1, 20.2, 20.3_

  - [ ]* 16.8 Write property test for general ledger
    - **Property 28: General Ledger Running Balance**
    - **Validates: Requirements 20.2, 20.3**

  - [ ] 16.9 Implement ReportService - Cash Flow Statement
    - Calculate operating, investing, financing cash flows
    - Reconcile net income to cash from operations
    - Show beginning and ending cash balances
    - _Requirements: 21.1, 21.2, 21.3_

  - [ ] 16.10 Implement ReportService - Aging Reports
    - Group invoices by age buckets (Current, 1-30, 31-60, 61-90, 90+)
    - Support both AR and AP aging
    - Calculate bucket totals
    - _Requirements: 22.1, 22.2, 22.3_

  - [ ]* 16.11 Write property test for aging reports
    - **Property 27: Aging Report Bucket Calculation**
    - **Validates: Requirements 22.1, 22.2**

  - [ ] 16.12 Implement report export (PDF, Excel, CSV)
    - Implement PDF generation for all reports
    - Implement Excel generation
    - Implement CSV generation
    - _Requirements: 23.1, 23.2, 23.3_

  - [ ] 16.13 Implement ReportController endpoints
    - All report endpoints with export options
    - _Requirements: 17.1, 18.1, 19.1, 20.1, 21.1, 22.1, 23.1_

- [ ] 17. Dashboard Module
  - [ ] 17.1 Implement DashboardService
    - Implement summary metrics (revenue, expenses, net income, cash balance)
    - Implement revenue trends
    - Implement expense breakdown by category
    - Implement cash flow forecast
    - Implement AR/AP summaries
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

  - [ ] 17.2 Implement DashboardController endpoints
    - GET /api/v1/dashboard/summary
    - GET /api/v1/dashboard/cash-flow-forecast
    - GET /api/v1/dashboard/revenue-trends
    - GET /api/v1/dashboard/expense-breakdown
    - GET /api/v1/dashboard/kpis
    - _Requirements: 24.1_

- [ ] 18. Organization Settings Module
  - [ ] 18.1 Implement OrganizationSettings
    - Fiscal year start configuration
    - Base currency configuration
    - Tax rate configuration
    - Payment terms configuration
    - Invoice number format configuration
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 32.6_

  - [ ] 18.2 Implement SettingsController endpoints
    - GET/PUT /api/v1/settings/organization
    - Tax rates CRUD
    - Payment terms CRUD
    - _Requirements: 32.1_

- [ ] 19. Checkpoint - Backend Complete
  - Ensure all backend tests pass
  - Verify all API endpoints work correctly
  - Verify all property tests pass
  - Ask the user if questions arise

- [ ] 20. Frontend - Core Services and State
  - [ ] 20.1 Implement NgRx store for accounts
    - Actions, reducers, effects, selectors
    - _Requirements: 6.1_

  - [ ] 20.2 Implement NgRx store for journal entries
    - Actions, reducers, effects, selectors
    - _Requirements: 7.1_

  - [ ] 20.3 Implement NgRx store for contacts
    - Actions, reducers, effects, selectors
    - _Requirements: 9.1_

  - [ ] 20.4 Implement NgRx store for invoices
    - Actions, reducers, effects, selectors
    - _Requirements: 10.1_

  - [ ] 20.5 Implement all feature services
    - AccountService, JournalEntryService, ContactService
    - InvoiceService, ExpenseService, BankAccountService
    - ReportService, DashboardService
    - _Requirements: 6.1, 7.1, 9.1, 10.1, 13.1, 14.1, 17.1, 24.1_

- [ ] 21. Frontend - Account Management UI
  - [ ] 21.1 Implement AccountListComponent
    - Data table with sorting, filtering, pagination
    - Import/export buttons
    - _Requirements: 6.1, 6.8, 30.3_

  - [ ] 21.2 Implement AccountFormComponent
    - Form with validation
    - Account type and subtype selection
    - Parent account selection
    - _Requirements: 6.1, 30.3_

- [ ] 22. Frontend - Journal Entry UI
  - [ ] 22.1 Implement JournalEntryListComponent
    - Data table with search filters
    - Status filter
    - _Requirements: 7.6, 7.7, 30.3_

  - [ ] 22.2 Implement JournalEntryFormComponent
    - Dynamic line items with add/remove
    - Real-time balance calculation
    - Account selector
    - _Requirements: 7.1, 30.3_

  - [ ] 22.3 Implement JournalEntryDetailComponent
    - View entry details
    - Workflow action buttons (approve, post, void, reverse)
    - Attachment upload/download
    - Audit trail display
    - _Requirements: 7.3, 7.4, 7.5, 8.1, 27.5, 30.3_

- [ ] 23. Frontend - Contact and Invoice UI
  - [ ] 23.1 Implement ContactListComponent and ContactFormComponent
    - _Requirements: 9.1, 30.3_

  - [ ] 23.2 Implement InvoiceListComponent
    - Status and type filters
    - Action buttons (send, record payment, export PDF)
    - _Requirements: 10.1, 11.1, 12.1, 30.3_

  - [ ] 23.3 Implement InvoiceFormComponent
    - Dynamic line items
    - Real-time total calculation
    - Contact selector
    - _Requirements: 10.1, 30.3_

- [ ] 24. Frontend - Bank Reconciliation UI
  - [ ] 24.1 Implement BankAccountListComponent
    - _Requirements: 14.1, 30.3_

  - [ ] 24.2 Implement BankReconciliationComponent
    - Split view: bank transactions and journal entries
    - Match, create entry, exclude actions
    - Complete reconciliation button
    - _Requirements: 15.1, 30.3_

- [ ] 25. Frontend - Reports UI
  - [ ] 25.1 Implement BalanceSheetComponent
    - Date picker
    - Comparative period toggle
    - Export buttons
    - _Requirements: 17.1, 23.1, 30.3_

  - [ ] 25.2 Implement IncomeStatementComponent
    - Date range picker
    - Comparative period toggle
    - Export buttons
    - _Requirements: 18.1, 23.1, 30.3_

  - [ ] 25.3 Implement GeneralLedgerComponent
    - Account selector
    - Date range picker
    - Running balance display
    - _Requirements: 20.1, 30.3_

  - [ ] 25.4 Implement AgingReportComponent
    - AR/AP toggle
    - Age bucket display
    - _Requirements: 22.1, 30.3_

- [ ] 26. Frontend - Dashboard UI
  - [ ] 26.1 Implement DashboardComponent
    - KPI cards
    - Revenue trends chart
    - Expense breakdown chart
    - Cash flow forecast
    - AR/AP summaries
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 30.3_

- [ ] 27. Frontend - Settings UI
  - [ ] 27.1 Implement OrganizationSettingsComponent
    - _Requirements: 32.1, 30.3_

  - [ ] 27.2 Implement FiscalPeriodManagementComponent
    - Period list with open/close actions
    - _Requirements: 25.1, 30.3_

- [ ] 28. Frontend - Responsive Design and Accessibility
  - [ ] 28.1 Implement responsive layouts
    - Desktop (1024px+) and tablet (768px-1023px) breakpoints
    - _Requirements: 30.1, 30.2_

  - [ ] 28.2 Implement dark/light theme support
    - _Requirements: 30.4_

  - [ ] 28.3 Implement keyboard navigation
    - _Requirements: 30.5_

- [ ] 29. API Documentation
  - [ ] 29.1 Configure OpenAPI/Swagger
    - Add springdoc-openapi dependency
    - Configure API documentation at /api/docs
    - Document all endpoints with schemas
    - Add authentication requirements
    - Add example requests/responses
    - _Requirements: 29.1, 29.2, 29.3, 29.4_

- [ ] 30. Final Checkpoint - Full Application Complete
  - Ensure all tests pass (unit and property-based)
  - Verify all API endpoints documented
  - Verify responsive design works
  - Verify accessibility requirements met
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using jqwik (backend) and fast-check (frontend)
- Unit tests validate specific examples and edge cases
- Backend uses Java 21 with Spring Boot 3.2+
- Frontend uses Angular 18+ with standalone components and NgRx
