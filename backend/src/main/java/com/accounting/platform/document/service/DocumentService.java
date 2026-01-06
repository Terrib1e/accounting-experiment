package com.accounting.platform.document.service;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.document.dto.DocumentDto;
import com.accounting.platform.document.entity.Document;
import com.accounting.platform.document.mapper.DocumentMapper;
import com.accounting.platform.document.repository.DocumentRepository;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.repository.JobRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final JobRepository jobRepository;
    private final ContactRepository contactRepository;

    @Value("${app.document.storage-path:./uploads}")
    private String storagePath;

    @Transactional
    public DocumentDto uploadDocument(MultipartFile file, UUID jobId, UUID contactId,
                                       String description, String category, String uploadedBy) throws IOException {
        // Create storage directory if it doesn't exist
        Path uploadDir = Paths.get(storagePath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String storedFilename = UUID.randomUUID().toString() + extension;

        // Save file to disk
        Path filePath = uploadDir.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create document entity
        Document document = new Document();
        document.setFilename(storedFilename);
        document.setOriginalFilename(originalFilename);
        document.setContentType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setStoragePath(filePath.toString());
        document.setDescription(description);
        document.setCategory(category);
        document.setUploadedBy(uploadedBy);

        // Associate with job if provided
        if (jobId != null) {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new EntityNotFoundException("Job not found: " + jobId));
            document.setJob(job);
        }

        // Associate with contact if provided
        if (contactId != null) {
            Contact contact = contactRepository.findById(contactId)
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + contactId));
            document.setContact(contact);
        }

        Document saved = documentRepository.save(document);
        log.info("Document uploaded: {} -> {}", originalFilename, storedFilename);

        return documentMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public Resource downloadDocument(UUID documentId) throws MalformedURLException {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));

        Path filePath = Paths.get(document.getStoragePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found or not readable: " + document.getOriginalFilename());
        }

        return resource;
    }

    @Transactional(readOnly = true)
    public DocumentDto getDocument(UUID documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));
        return documentMapper.toDto(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getDocumentsForJob(UUID jobId) {
        return documentRepository.findByJobIdOrderByCreatedAtDesc(jobId)
                .stream()
                .map(documentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getDocumentsForContact(UUID contactId) {
        return documentRepository.findByContactIdOrderByCreatedAtDesc(contactId)
                .stream()
                .map(documentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(UUID documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));

        // Delete file from disk
        try {
            Path filePath = Paths.get(document.getStoragePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file from disk: {}", document.getStoragePath(), e);
        }

        documentRepository.delete(document);
        log.info("Document deleted: {}", document.getOriginalFilename());
    }
}
