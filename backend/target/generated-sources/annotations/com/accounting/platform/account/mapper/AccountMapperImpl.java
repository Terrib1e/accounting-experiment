package com.accounting.platform.account.mapper;

import com.accounting.platform.account.dto.AccountDto;
import com.accounting.platform.account.dto.AccountHierarchyDto;
import com.accounting.platform.account.entity.Account;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-05T23:23:37-0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class AccountMapperImpl implements AccountMapper {

    @Override
    public AccountDto toDto(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountDto accountDto = new AccountDto();

        accountDto.setActive( account.isActive() );
        accountDto.setCode( account.getCode() );
        accountDto.setCurrency( account.getCurrency() );
        accountDto.setDescription( account.getDescription() );
        accountDto.setId( account.getId() );
        accountDto.setName( account.getName() );
        accountDto.setParentAccountId( account.getParentAccountId() );
        accountDto.setSubtype( account.getSubtype() );
        accountDto.setType( account.getType() );

        return accountDto;
    }

    @Override
    public Account toEntity(AccountDto dto) {
        if ( dto == null ) {
            return null;
        }

        Account account = new Account();

        account.setId( dto.getId() );
        account.setActive( dto.isActive() );
        account.setCode( dto.getCode() );
        account.setCurrency( dto.getCurrency() );
        account.setDescription( dto.getDescription() );
        account.setName( dto.getName() );
        account.setParentAccountId( dto.getParentAccountId() );
        account.setSubtype( dto.getSubtype() );
        account.setType( dto.getType() );

        return account;
    }

    @Override
    public AccountHierarchyDto toHierarchyDto(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountHierarchyDto accountHierarchyDto = new AccountHierarchyDto();

        accountHierarchyDto.setCode( account.getCode() );
        accountHierarchyDto.setId( account.getId() );
        accountHierarchyDto.setName( account.getName() );
        accountHierarchyDto.setParentAccountId( account.getParentAccountId() );
        accountHierarchyDto.setSubtype( account.getSubtype() );
        accountHierarchyDto.setType( account.getType() );

        return accountHierarchyDto;
    }
}
