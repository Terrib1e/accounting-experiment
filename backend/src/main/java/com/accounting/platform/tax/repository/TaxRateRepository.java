package com.accounting.platform.tax.repository;

import com.accounting.platform.tax.entity.TaxRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TaxRateRepository extends JpaRepository<TaxRate, UUID> {
    boolean existsByCode(String code);
}
