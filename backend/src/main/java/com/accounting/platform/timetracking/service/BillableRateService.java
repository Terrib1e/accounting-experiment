package com.accounting.platform.timetracking.service;

import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.security.entity.User;
import com.accounting.platform.security.repository.UserRepository;
import com.accounting.platform.timetracking.entity.BillableRate;
import com.accounting.platform.timetracking.repository.BillableRateRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillableRateService {

    private final BillableRateRepository billableRateRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;

    @Transactional(readOnly = true)
    public List<BillableRate> getAllRates() {
        return billableRateRepository.findAllActiveWithRelations();
    }

    @Transactional(readOnly = true)
    public List<BillableRate> getRatesForUser(UUID userId) {
        return billableRateRepository.findByUserIdAndActiveTrue(userId);
    }

    @Transactional
    public BillableRate createRate(UUID userId, UUID contactId, BigDecimal hourlyRate, LocalDate effectiveDate, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        BillableRate rate = new BillableRate();
        rate.setUser(user);
        rate.setHourlyRate(hourlyRate);
        rate.setEffectiveDate(effectiveDate);
        rate.setDescription(description);
        rate.setActive(true);

        if (contactId != null) {
            rate.setContact(contactRepository.findById(contactId)
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + contactId)));
        }

        BillableRate saved = billableRateRepository.save(rate);
        log.info("Created billable rate: {} for user {} at ${}/hr", saved.getId(), user.getEmail(), hourlyRate);

        return saved;
    }

    @Transactional
    public BillableRate updateRate(UUID rateId, BigDecimal hourlyRate, String description) {
        BillableRate rate = billableRateRepository.findById(rateId)
                .orElseThrow(() -> new EntityNotFoundException("Billable rate not found: " + rateId));

        rate.setHourlyRate(hourlyRate);
        rate.setDescription(description);

        return billableRateRepository.save(rate);
    }

    @Transactional
    public void deactivateRate(UUID rateId) {
        BillableRate rate = billableRateRepository.findById(rateId)
                .orElseThrow(() -> new EntityNotFoundException("Billable rate not found: " + rateId));

        rate.setActive(false);
        billableRateRepository.save(rate);
        log.info("Deactivated billable rate: {}", rateId);
    }

    @Transactional(readOnly = true)
    public BigDecimal getEffectiveRate(UUID userId, UUID contactId, LocalDate date) {
        // First try client-specific rate
        if (contactId != null) {
            var clientRate = billableRateRepository.findEffectiveRateForUserAndContact(userId, contactId, date);
            if (clientRate.isPresent()) {
                return clientRate.get().getHourlyRate();
            }
        }

        // Fall back to default user rate
        return billableRateRepository.findDefaultEffectiveRateForUser(userId, date)
                .map(BillableRate::getHourlyRate)
                .orElse(BigDecimal.valueOf(100)); // Default rate
    }

    @Transactional
    public BillableRate setDefaultRateForCurrentUser(BigDecimal hourlyRate) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        return createRate(user.getId(), null, hourlyRate, LocalDate.now(), "Default rate");
    }
}
