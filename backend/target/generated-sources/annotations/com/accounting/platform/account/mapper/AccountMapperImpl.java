package com.accounting.platform.account.mapper;

import com.accounting.platform.account.dto.AccountDto;
import com.accounting.platform.account.dto.AccountHierarchyDto;
import com.accounting.platform.account.entity.Account;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-09T14:16:58-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Amazon.com Inc.)"
)
@Component
public class AccountMapperImpl implements AccountMapper {

    @Override
    public AccountDto toDto(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountDto accountDto = new AccountDto();

        accountDto.setId( account.getId() );
        accountDto.setCode( account.getCode() );
        accountDto.setName( account.getName() );
        accountDto.setDescription( account.getDescription() );
        accountDto.setType( account.getType() );
        accountDto.setSubtype( account.getSubtype() );
        accountDto.setParentAccountId( account.getParentAccountId() );
        accountDto.setActive( account.isActive() );
        accountDto.setCurrency( account.getCurrency() );

        return accountDto;
    }

    @Override
    public Account toEntity(AccountDto dto) {
        if ( dto == null ) {
            return null;
        }

        Account account = new Account();

        account.setId( dto.getId() );
        account.setCode( dto.getCode() );
        account.setName( dto.getName() );
        account.setDescription( dto.getDescription() );
        account.setType( dto.getType() );
        account.setSubtype( dto.getSubtype() );
        account.setParentAccountId( dto.getParentAccountId() );
        account.setActive( dto.isActive() );
        account.setCurrency( dto.getCurrency() );

        return account;
    }

    @Override
    public AccountHierarchyDto toHierarchyDto(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountHierarchyDto accountHierarchyDto = new AccountHierarchyDto();

        accountHierarchyDto.setId( account.getId() );
        accountHierarchyDto.setCode( account.getCode() );
        accountHierarchyDto.setName( account.getName() );
        accountHierarchyDto.setType( account.getType() );
        accountHierarchyDto.setSubtype( account.getSubtype() );
        accountHierarchyDto.setParentAccountId( account.getParentAccountId() );

        return accountHierarchyDto;
    }
}
