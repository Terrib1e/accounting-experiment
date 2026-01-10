package com.accounting.platform.timetracking.repository;

import com.accounting.platform.timetracking.entity.BillableRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillableRateRepository extends JpaRepository<BillableRate, UUID> {

    List<BillableRate> findByUserIdAndActiveTrue(UUID userId);

    List<BillableRate> findByUserIdAndContactIdAndActiveTrue(UUID userId, UUID contactId);

    @Query("SELECT br FROM BillableRate br WHERE br.user.id = :userId AND br.contact.id = :contactId AND br.effectiveDate <= :date AND br.active = true ORDER BY br.effectiveDate DESC")
    Optional<BillableRate> findEffectiveRateForUserAndContact(
            @Param("userId") UUID userId,
            @Param("contactId") UUID contactId,
            @Param("date") LocalDate date
    );

    @Query("SELECT br FROM BillableRate br WHERE br.user.id = :userId AND br.contact IS NULL AND br.effectiveDate <= :date AND br.active = true ORDER BY br.effectiveDate DESC")
    Optional<BillableRate> findDefaultEffectiveRateForUser(
            @Param("userId") UUID userId,
            @Param("date") LocalDate date
    );

    @Query("SELECT br FROM BillableRate br LEFT JOIN FETCH br.user LEFT JOIN FETCH br.contact WHERE br.active = true ORDER BY br.user.lastName, br.effectiveDate DESC")
    List<BillableRate> findAllActiveWithRelations();
}
