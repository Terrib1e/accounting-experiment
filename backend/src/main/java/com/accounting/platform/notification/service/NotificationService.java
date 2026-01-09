package com.accounting.platform.notification.service;

import com.accounting.platform.notification.entity.Notification;
import com.accounting.platform.notification.entity.NotificationCategory;
import com.accounting.platform.notification.entity.NotificationType;
import com.accounting.platform.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<Notification> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUnreadNotifications(Pageable pageable) {
        return notificationRepository.findByReadFalseOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByReadFalse();
    }

    @Transactional
    public Notification createNotification(String title, String message,
            NotificationType type, NotificationCategory category,
            String entityType, String entityId, String actionUrl) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCategory(category);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setActionUrl(actionUrl);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAsRead(UUID id) {
        notificationRepository.markAsRead(id);
    }

    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsRead();
    }

    @Transactional
    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }

    // Convenience methods for creating specific types of notifications

    public void notifyInvoiceApproved(String invoiceNumber, UUID invoiceId) {
        createNotification(
            "Invoice Approved",
            "Invoice #" + invoiceNumber + " has been approved.",
            NotificationType.SUCCESS,
            NotificationCategory.INVOICE,
            "Invoice",
            invoiceId.toString(),
            "/invoices"
        );
    }

    public void notifyInvoicePaid(String invoiceNumber, UUID invoiceId) {
        createNotification(
            "Payment Received",
            "Payment received for Invoice #" + invoiceNumber + ".",
            NotificationType.SUCCESS,
            NotificationCategory.PAYMENT,
            "Invoice",
            invoiceId.toString(),
            "/invoices"
        );
    }

    public void notifyExpenseApproved(String referenceNumber, UUID expenseId) {
        createNotification(
            "Expense Approved",
            "Expense #" + referenceNumber + " has been approved.",
            NotificationType.SUCCESS,
            NotificationCategory.EXPENSE,
            "Expense",
            expenseId.toString(),
            "/expenses"
        );
    }

    public void notifyExpensePaid(String referenceNumber, UUID expenseId) {
        createNotification(
            "Expense Paid",
            "Expense #" + referenceNumber + " has been paid.",
            NotificationType.SUCCESS,
            NotificationCategory.PAYMENT,
            "Expense",
            expenseId.toString(),
            "/expenses"
        );
    }

    public void notifyJobCreated(String clientName, UUID jobId) {
        createNotification(
            "New Job Created",
            "A new job has been created for " + clientName + ".",
            NotificationType.INFO,
            NotificationCategory.JOB,
            "Job",
            jobId.toString(),
            "/workflow"
        );
    }

    public void notifyJobCompleted(String clientName, UUID jobId) {
        createNotification(
            "Job Completed",
            "Job for " + clientName + " has been marked as complete.",
            NotificationType.SUCCESS,
            NotificationCategory.JOB,
            "Job",
            jobId.toString(),
            "/workflow"
        );
    }
}
