package com.accounting.platform.document.controller;

import com.accounting.platform.document.dto.DocumentDto;
import com.accounting.platform.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document management APIs")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document")
    public ResponseEntity<DocumentDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobId", required = false) UUID jobId,
            @RequestParam(value = "contactId", required = false) UUID contactId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            Authentication authentication) throws IOException {

        String uploadedBy = authentication != null ? authentication.getName() : "system";
        DocumentDto document = documentService.uploadDocument(file, jobId, contactId, description, category, uploadedBy);
        return new ResponseEntity<>(document, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document metadata")
    public ResponseEntity<DocumentDto> getDocument(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getDocument(id));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download a document")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID id) throws MalformedURLException {
        DocumentDto document = documentService.getDocument(id);
        Resource resource = documentService.downloadDocument(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/job/{jobId}")
    @Operation(summary = "Get all documents for a job")
    public ResponseEntity<List<DocumentDto>> getDocumentsForJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(documentService.getDocumentsForJob(jobId));
    }

    @GetMapping("/contact/{contactId}")
    @Operation(summary = "Get all documents for a contact")
    public ResponseEntity<List<DocumentDto>> getDocumentsForContact(@PathVariable UUID contactId) {
        return ResponseEntity.ok(documentService.getDocumentsForContact(contactId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
