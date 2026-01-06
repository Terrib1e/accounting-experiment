package com.accounting.platform.document.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class DocumentDto {
    private UUID id;
    private String filename;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String description;
    private String category;
    private UUID jobId;
    private String jobName;
    private UUID contactId;
    private String contactName;
    private String uploadedBy;
    private Instant createdAt;
}
