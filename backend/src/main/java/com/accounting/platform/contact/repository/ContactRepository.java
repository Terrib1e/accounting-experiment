package com.accounting.platform.contact.repository;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.entity.ContactType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {
    Page<Contact> findByType(ContactType type, Pageable pageable);

    Optional<Contact> findByName(String name);

    boolean existsByName(String name);

    Optional<Contact> findByEmail(String email);
}
