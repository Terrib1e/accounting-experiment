package com.accounting.platform.contact.service;

import com.accounting.platform.audit.service.AuditService;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.entity.ContactType;
import com.accounting.platform.contact.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final AuditService auditService;

    public Page<Contact> getAllContacts(Pageable pageable) {
        return contactRepository.findAll(pageable);
    }

    public Page<Contact> getContactsByType(ContactType type, Pageable pageable) {
        return contactRepository.findByType(type, pageable);
    }

    public Contact getContactById(UUID id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contact not found"));
    }

    @Transactional
    public Contact createContact(Contact contact) {
        if (contactRepository.existsByName(contact.getName())) {
             // Depending on requirements, name duplicates might be allowed, but let's warn for now
             // For strict uniqueness, we'd throw.
        }

        Contact saved = contactRepository.save(contact);
        auditService.logCreate("Contact", saved.getId(), saved);
        return saved;
    }

    @Transactional
    public Contact updateContact(UUID id, Contact contactDetails) {
        Contact contact = getContactById(id);

        contact.setName(contactDetails.getName());
        contact.setType(contactDetails.getType());
        contact.setEmail(contactDetails.getEmail());
        contact.setPhone(contactDetails.getPhone());
        contact.setAddress(contactDetails.getAddress());
        contact.setTaxId(contactDetails.getTaxId());
        contact.setActive(contactDetails.isActive());
        contact.setCurrency(contactDetails.getCurrency());

        Contact updated = contactRepository.save(contact);
        auditService.logUpdate("Contact", updated.getId(), null, updated);
        return updated;
    }

    @Transactional
    public void deleteContact(UUID id) {
        Contact contact = getContactById(id);

        // TODO: Check for dependent entities (Invoices, etc.)

        contactRepository.delete(contact);
        auditService.logDelete("Contact", id, contact);
    }
}
