package com.accounting.platform.audit.service;

import com.accounting.platform.audit.entity.AuditLog;
import com.accounting.platform.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logAction(String action, String entityType, UUID entityId, Object details) {
        saveLog(action, entityType, entityId, details, null, null);
    }

    @Transactional
    public void logCreate(String entityType, UUID entityId, Object newValue) {
        saveLog("CREATE", entityType, entityId, null, null, newValue);
    }

    @Transactional
    public void logUpdate(String entityType, UUID entityId, Object oldValue, Object newValue) {
        saveLog("UPDATE", entityType, entityId, null, oldValue, newValue);
    }

    @Transactional
    public void logDelete(String entityType, UUID entityId, Object oldValue) {
        saveLog("DELETE", entityType, entityId, null, oldValue, null);
    }

    private void saveLog(String action, String entityType, UUID entityId, Object details, Object oldValue, Object newValue) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);

            enrichWithUserContext(log);

            if (details != null) {
                log.setDetails(objectMapper.writeValueAsString(details));
            }
            if (oldValue != null) {
                log.setOldValue(objectMapper.writeValueAsString(oldValue));
            }
            if (newValue != null) {
                log.setNewValue(objectMapper.writeValueAsString(newValue));
            }

            auditLogRepository.save(log);
        } catch (JsonProcessingException e) {
            log.error("Error serializing audit log data", e);
        } catch (Exception e) {
            log.error("Error saving audit log", e);
        }
    }

    private void enrichWithUserContext(AuditLog log) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            log.setUsername(authentication.getName());
            // In a real app, we'd cast principal to our UserDetails implementation to get ID
            // log.setUserId(...);
        } else {
            log.setUsername("SYSTEM");
        }
        // IP Address and User Agent would typically come from RequestContextHolder or a filter
    }
}
