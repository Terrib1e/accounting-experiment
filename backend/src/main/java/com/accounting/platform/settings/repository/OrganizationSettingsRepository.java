package com.accounting.platform.settings.repository;

import com.accounting.platform.settings.entity.OrganizationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrganizationSettingsRepository extends JpaRepository<OrganizationSettings, UUID> {
    // We strictly only ever want one row roughly.
}
