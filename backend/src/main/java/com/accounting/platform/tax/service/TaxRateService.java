package com.accounting.platform.tax.service;

import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.tax.entity.TaxRate;
import com.accounting.platform.tax.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaxRateService {

    private final TaxRateRepository taxRateRepository;
    private final AuditService auditService;

    public Page<TaxRate> getAllTaxRates(Pageable pageable) {
        return taxRateRepository.findAll(pageable);
    }

    public TaxRate getTaxRateById(UUID id) {
        return taxRateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tax Rate not found"));
    }

    @Transactional
    public TaxRate createTaxRate(TaxRate taxRate) {
        if (taxRateRepository.existsByCode(taxRate.getCode())) {
            throw new IllegalArgumentException("Tax Code already exists: " + taxRate.getCode());
        }
        TaxRate saved = taxRateRepository.save(taxRate);
        auditService.logCreate("TaxRate", saved.getId(), saved);
        return saved;
    }

    @Transactional
    public TaxRate updateTaxRate(UUID id, TaxRate details) {
        TaxRate existing = getTaxRateById(id);

        existing.setName(details.getName());
        existing.setRate(details.getRate());
        existing.setActive(details.isActive());
        existing.setDescription(details.getDescription());
        // Code is usually immutable or requires careful checking, skipping update for simplicity

        TaxRate saved = taxRateRepository.save(existing);
        auditService.logUpdate("TaxRate", saved.getId(), null, saved);
        return saved;
    }

    @Transactional
    public void deleteTaxRate(UUID id) {
        TaxRate existing = getTaxRateById(id);
        taxRateRepository.delete(existing);
        auditService.logDelete("TaxRate", id, existing);
    }
}
