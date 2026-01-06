package com.accounting.platform.settings.service;

import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.settings.entity.OrganizationSettings;
import com.accounting.platform.settings.repository.OrganizationSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationSettingsService {

    private final OrganizationSettingsRepository repository;
    private final AuditService auditService;

    public OrganizationSettings getSettings() {
        List<OrganizationSettings> all = repository.findAll();
        if (all.isEmpty()) {
            // Return default or throw? Let's return a default empty object or create one.
            // Better to decouple creation. For now return null or empty instance if none.
            return new OrganizationSettings();
        }
        return all.get(0);
    }

    @Transactional
    public OrganizationSettings updateSettings(OrganizationSettings settings) {
        List<OrganizationSettings> all = repository.findAll();
        OrganizationSettings existing;

        if (all.isEmpty()) {
            existing = new OrganizationSettings();
        } else {
            existing = all.get(0);
        }

        existing.setOrganizationName(settings.getOrganizationName());
        existing.setTaxId(settings.getTaxId());
        existing.setBaseCurrency(settings.getBaseCurrency());
        existing.setAddress(settings.getAddress());
        existing.setPhone(settings.getPhone());
        existing.setEmail(settings.getEmail());

        OrganizationSettings saved = repository.save(existing);
        auditService.logAction("UPDATE_ORG_SETTINGS", "OrganizationSettings", saved.getId(), "Updated organization settings");
        return saved;
    }
}
