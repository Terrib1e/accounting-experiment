package com.accounting.platform.account.entity;

import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "accounts")
public class Account extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountSubtype subtype;

    @Column(name = "parent_account_id")
    private UUID parentAccountId;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private String currency; // 'USD', 'EUR', etc.
}
