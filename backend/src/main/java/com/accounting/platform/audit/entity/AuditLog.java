package com.accounting.platform.audit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String action;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "username")
    private String username;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String details;

    @Column(name = "old_value", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String newValue;

    @Column(name = "correlation_id")
    private String correlationId;

    @PrePersist
    public void prePersist() {
        this.timestamp = Instant.now();
    }
}
