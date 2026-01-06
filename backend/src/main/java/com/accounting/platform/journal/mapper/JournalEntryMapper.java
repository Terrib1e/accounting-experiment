package com.accounting.platform.journal.mapper;

import com.accounting.platform.journal.dto.JournalEntryDto;
import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.entity.JournalEntryLine;
import com.accounting.platform.account.entity.Account;
import com.accounting.platform.account.repository.AccountRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class JournalEntryMapper {

    @Autowired
    protected AccountRepository accountRepository;

    @Mapping(target = "lines", source = "lines")
    @Mapping(target = "entryNumber", ignore = true)
    public abstract JournalEntryDto toDto(JournalEntry entry);

    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
                                                                                    @Mapping(target = "updatedBy", ignore = true)
    public abstract JournalEntry toEntity(JournalEntryDto dto);

    @Mapping(source = "account.id", target = "accountId")
    @Mapping(source = "account.name", target = "accountName")
    public abstract JournalEntryDto.JournalEntryLineDto toLineDto(JournalEntryLine line);

    @Mapping(target = "account", source = "accountId")
    @Mapping(target = "journalEntry", ignore = true)
    public abstract JournalEntryLine toLineEntity(JournalEntryDto.JournalEntryLineDto lineDto);

    public Account map(java.util.UUID value) {
        if (value == null) return null;
        return accountRepository.getReferenceById(value);
    }
}
