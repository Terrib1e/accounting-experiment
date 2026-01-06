package com.accounting.platform.settings.service;

import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.settings.entity.FiscalPeriod;
import com.accounting.platform.settings.entity.FiscalPeriodStatus;
import com.accounting.platform.settings.repository.FiscalPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FiscalPeriodService {

    private final FiscalPeriodRepository fiscalPeriodRepository;
    private final AuditService auditService;

    public List<FiscalPeriod> getAllPeriods() {
        return fiscalPeriodRepository.findAll();
    }

    @Transactional
    public FiscalPeriod createPeriod(FiscalPeriod period) {
        if (period.getStartDate().isAfter(period.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        if (fiscalPeriodRepository.existsOverlappingPeriod(period.getStartDate(), period.getEndDate())) {
            throw new IllegalArgumentException("Fiscal period overlaps with an existing period");
        }

        // Default status if not set
        if (period.getStatus() == null) {
            period.setStatus(FiscalPeriodStatus.OPEN);
        }

        FiscalPeriod saved = fiscalPeriodRepository.save(period);
        auditService.logCreate("FiscalPeriod", saved.getId(), saved);
        return saved;
    }

    @Transactional
    public FiscalPeriod closePeriod(UUID id) {
        FiscalPeriod period = fiscalPeriodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fiscal period not found"));

        if (period.getStatus() != FiscalPeriodStatus.OPEN) {
            throw new IllegalStateException("Period is not open");
        }

        // TODO: Validate reconciliation of sub-ledgers

        period.setStatus(FiscalPeriodStatus.CLOSED);
        period.setClosedAt(LocalDate.now());
        // period.setClosedBy(currentUser); // Handled by backend context usually

        FiscalPeriod saved = fiscalPeriodRepository.save(period);
        auditService.logAction("CLOSE_FISCAL_PERIOD", "FiscalPeriod", id, null);
        return saved;
    }

    public boolean isDateInOpenPeriod(LocalDate date) {
        return fiscalPeriodRepository.findOpenPeriodForDate(date).isPresent();
    }
}
