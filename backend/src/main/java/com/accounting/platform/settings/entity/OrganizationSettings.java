package com.accounting.platform.settings.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "organization_settings")
public class OrganizationSettings extends BaseEntity {

    @Column(name = "org_name", nullable = false)
    private String organizationName;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "base_currency", nullable = false, length = 3)
    private String baseCurrency;

    private String address;
    private String phone;
    private String email;

    // Website, Logo URL, etc. could be added here
}
