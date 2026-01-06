package com.accounting.platform.document.repository;

import com.accounting.platform.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByJobId(UUID jobId);

    List<Document> findByContactId(UUID contactId);

    List<Document> findByJobIdOrderByCreatedAtDesc(UUID jobId);

    List<Document> findByContactIdOrderByCreatedAtDesc(UUID contactId);
}
