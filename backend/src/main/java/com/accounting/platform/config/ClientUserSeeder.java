package com.accounting.platform.config;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.security.entity.Role;
import com.accounting.platform.security.entity.User;
import com.accounting.platform.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class ClientUserSeeder {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Order(2) // Run after WorkflowDataSeeder which creates contacts
    public CommandLineRunner seedClientUser() {
        return args -> {
            String clientEmail = "client@acme.com";

            if (userRepository.findByEmail(clientEmail).isPresent()) {
                log.info("Test client user already exists: {}", clientEmail);
                return;
            }

            // Find Acme Corp contact (created by WorkflowDataSeeder)
            Contact acmeContact = contactRepository.findByEmail("john@acme.com").orElse(null);
            if (acmeContact == null) {
                log.warn("Acme Corp contact not found. Run WorkflowDataSeeder first.");
                return;
            }

            // Create client user
            User clientUser = new User();
            clientUser.setEmail(clientEmail);
            clientUser.setPasswordHash(passwordEncoder.encode("password123"));
            clientUser.setFirstName("Acme");
            clientUser.setLastName("Client");
            clientUser.setRole(Role.CLIENT);
            clientUser.setContact(acmeContact);
            clientUser.setEnabled(true);
            clientUser.setAccountNonLocked(true);

            userRepository.save(clientUser);

            log.info("============================================");
            log.info("TEST CLIENT USER CREATED:");
            log.info("  Email:    {}", clientEmail);
            log.info("  Password: password123");
            log.info("  Role:     CLIENT");
            log.info("  Linked to: Acme Corp");
            log.info("  Portal URL: http://localhost:4200/portal");
            log.info("============================================");
        };
    }
}
