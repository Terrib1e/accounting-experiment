package com.accounting.platform.contact.entity;

import com.accounting.platform.common.converter.EncryptedStringConverter;
import com.accounting.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "contacts")
public class Contact extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactType type;

    private String email;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "tax_id")
    private String taxId;

    @Column(nullable = false)
    private boolean active = true;

    private String currency;
}
