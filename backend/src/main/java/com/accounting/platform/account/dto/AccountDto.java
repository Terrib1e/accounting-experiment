package com.accounting.platform.account.dto;

import com.accounting.platform.account.entity.AccountType;
import com.accounting.platform.account.entity.AccountSubtype;
import lombok.Data;

import java.util.UUID;

@Data
public class AccountDto {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private AccountType type;
    private AccountSubtype subtype;
    private UUID parentAccountId;
    private boolean active;
    private String currency;
}
