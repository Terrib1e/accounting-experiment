package com.accounting.platform.contact.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Contact>>> getAllContacts(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(contactService.getAllContacts(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Contact>> getContactById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(contactService.getContactById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Contact>> createContact(@RequestBody @Valid Contact contact) {
        return ResponseEntity.ok(ApiResponse.success(contactService.createContact(contact)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Contact>> updateContact(@PathVariable UUID id, @RequestBody @Valid Contact contact) {
        return ResponseEntity.ok(ApiResponse.success(contactService.updateContact(id, contact)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable UUID id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
