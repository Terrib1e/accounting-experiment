package com.accounting.platform.document.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.workflow.entity.Job;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "documents")
@Getter
@Setter
public class Document extends BaseEntity {

    @Column(nullable = false)
    private String filename; // Stored filename (UUID-based)

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String category; // e.g., "Tax Return", "W2", "Receipt", "Statement"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Column(name = "uploaded_by")
    private String uploadedBy;
}
