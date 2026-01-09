package com.accounting.platform.notification.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type = NotificationType.INFO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationCategory category = NotificationCategory.SYSTEM;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "entity_type")
    private String entityType; // e.g., "Invoice", "Expense", "Job"

    @Column(name = "entity_id")
    private String entityId; // ID of the related entity

    @Column(name = "action_url")
    private String actionUrl; // URL to navigate to when clicked
}
