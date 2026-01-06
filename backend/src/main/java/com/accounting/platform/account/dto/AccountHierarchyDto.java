package com.accounting.platform.account.dto;

import com.accounting.platform.account.entity.AccountType;
import com.accounting.platform.account.entity.AccountSubtype;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class AccountHierarchyDto {
    private UUID id;
    private String code;
    private String name;
    private AccountType type;
    private AccountSubtype subtype;
    private UUID parentAccountId;
    private List<AccountHierarchyDto> children;
}
