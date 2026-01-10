package com.accounting.platform.journal.mapper;

import com.accounting.platform.account.entity.Account;
import com.accounting.platform.journal.dto.JournalEntryDto;
import com.accounting.platform.journal.entity.JournalEntry;
import com.accounting.platform.journal.entity.JournalEntryLine;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-09T21:18:59-0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260101-2150, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class JournalEntryMapperImpl extends JournalEntryMapper {

    @Override
    public JournalEntryDto toDto(JournalEntry entry) {
        if ( entry == null ) {
            return null;
        }

        JournalEntryDto journalEntryDto = new JournalEntryDto();

        journalEntryDto.setLines( journalEntryLineListToJournalEntryLineDtoList( entry.getLines() ) );
        journalEntryDto.setDescription( entry.getDescription() );
        journalEntryDto.setEntryDate( entry.getEntryDate() );
        journalEntryDto.setId( entry.getId() );
        journalEntryDto.setReferenceNumber( entry.getReferenceNumber() );
        journalEntryDto.setStatus( entry.getStatus() );

        return journalEntryDto;
    }

    @Override
    public JournalEntry toEntity(JournalEntryDto dto) {
        if ( dto == null ) {
            return null;
        }

        JournalEntry journalEntry = new JournalEntry();

        journalEntry.setId( dto.getId() );
        journalEntry.setDescription( dto.getDescription() );
        journalEntry.setEntryDate( dto.getEntryDate() );
        journalEntry.setLines( journalEntryLineDtoListToJournalEntryLineList( dto.getLines() ) );
        journalEntry.setReferenceNumber( dto.getReferenceNumber() );
        journalEntry.setStatus( dto.getStatus() );

        return journalEntry;
    }

    @Override
    public JournalEntryDto.JournalEntryLineDto toLineDto(JournalEntryLine line) {
        if ( line == null ) {
            return null;
        }

        JournalEntryDto.JournalEntryLineDto journalEntryLineDto = new JournalEntryDto.JournalEntryLineDto();

        journalEntryLineDto.setAccountId( lineAccountId( line ) );
        journalEntryLineDto.setAccountName( lineAccountName( line ) );
        journalEntryLineDto.setCredit( line.getCredit() );
        journalEntryLineDto.setDebit( line.getDebit() );
        journalEntryLineDto.setDescription( line.getDescription() );
        journalEntryLineDto.setId( line.getId() );

        return journalEntryLineDto;
    }

    @Override
    public JournalEntryLine toLineEntity(JournalEntryDto.JournalEntryLineDto lineDto) {
        if ( lineDto == null ) {
            return null;
        }

        JournalEntryLine journalEntryLine = new JournalEntryLine();

        journalEntryLine.setAccount( map( lineDto.getAccountId() ) );
        journalEntryLine.setCredit( lineDto.getCredit() );
        journalEntryLine.setDebit( lineDto.getDebit() );
        journalEntryLine.setDescription( lineDto.getDescription() );
        journalEntryLine.setId( lineDto.getId() );

        return journalEntryLine;
    }

    protected List<JournalEntryDto.JournalEntryLineDto> journalEntryLineListToJournalEntryLineDtoList(List<JournalEntryLine> list) {
        if ( list == null ) {
            return null;
        }

        List<JournalEntryDto.JournalEntryLineDto> list1 = new ArrayList<JournalEntryDto.JournalEntryLineDto>( list.size() );
        for ( JournalEntryLine journalEntryLine : list ) {
            list1.add( toLineDto( journalEntryLine ) );
        }

        return list1;
    }

    protected List<JournalEntryLine> journalEntryLineDtoListToJournalEntryLineList(List<JournalEntryDto.JournalEntryLineDto> list) {
        if ( list == null ) {
            return null;
        }

        List<JournalEntryLine> list1 = new ArrayList<JournalEntryLine>( list.size() );
        for ( JournalEntryDto.JournalEntryLineDto journalEntryLineDto : list ) {
            list1.add( toLineEntity( journalEntryLineDto ) );
        }

        return list1;
    }

    private UUID lineAccountId(JournalEntryLine journalEntryLine) {
        if ( journalEntryLine == null ) {
            return null;
        }
        Account account = journalEntryLine.getAccount();
        if ( account == null ) {
            return null;
        }
        UUID id = account.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String lineAccountName(JournalEntryLine journalEntryLine) {
        if ( journalEntryLine == null ) {
            return null;
        }
        Account account = journalEntryLine.getAccount();
        if ( account == null ) {
            return null;
        }
        String name = account.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
