package com.accounting.platform.account.mapper;

import com.accounting.platform.account.dto.AccountDto;
import com.accounting.platform.account.dto.AccountHierarchyDto;
import com.accounting.platform.account.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    AccountDto toDto(Account account);
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Account toEntity(AccountDto dto);

    @Mapping(target = "children", ignore = true)
    AccountHierarchyDto toHierarchyDto(Account account);
}
