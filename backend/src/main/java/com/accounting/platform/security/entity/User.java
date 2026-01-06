package com.accounting.platform.security.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.accounting.platform.contact.entity.Contact;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    // Link to Contact for client portal users (null for staff users)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "mfa_enabled")
    private boolean mfaEnabled;

    @Column(name = "mfa_secret")
    private String mfaSecret;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "account_non_locked")
    private boolean accountNonLocked = true;

    @Column(name = "failed_attempt")
    private int failedAttempt;

    @Column(name = "lock_time")
    private Instant lockTime;
}
