package com.accounting.platform.settings.repository;

import com.accounting.platform.settings.entity.FiscalPeriod;
import com.accounting.platform.settings.entity.FiscalPeriodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FiscalPeriodRepository extends JpaRepository<FiscalPeriod, UUID> {

    @Query("SELECT fp FROM FiscalPeriod fp WHERE fp.status = 'OPEN' AND ?1 BETWEEN fp.startDate AND fp.endDate")
    Optional<FiscalPeriod> findOpenPeriodForDate(LocalDate date);

    @Query("SELECT fp FROM FiscalPeriod fp WHERE ?1 BETWEEN fp.startDate AND fp.endDate")
    Optional<FiscalPeriod> findPeriodForDate(LocalDate date);

    List<FiscalPeriod> findByStatus(FiscalPeriodStatus status);

    @Query("SELECT COUNT(fp) > 0 FROM FiscalPeriod fp WHERE " +
           "(fp.startDate BETWEEN ?1 AND ?2) OR (fp.endDate BETWEEN ?1 AND ?2) OR " +
           "(?1 BETWEEN fp.startDate AND fp.endDate)")
    boolean existsOverlappingPeriod(LocalDate startDate, LocalDate endDate);
}
