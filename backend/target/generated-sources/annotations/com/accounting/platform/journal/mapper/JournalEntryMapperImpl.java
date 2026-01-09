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
    date = "2026-01-08T22:37:17-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Amazon.com Inc.)"
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
        journalEntryDto.setId( entry.getId() );
        journalEntryDto.setEntryDate( entry.getEntryDate() );
        journalEntryDto.setDescription( entry.getDescription() );
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
        journalEntry.setEntryDate( dto.getEntryDate() );
        journalEntry.setDescription( dto.getDescription() );
        journalEntry.setReferenceNumber( dto.getReferenceNumber() );
        journalEntry.setStatus( dto.getStatus() );
        journalEntry.setLines( journalEntryLineDtoListToJournalEntryLineList( dto.getLines() ) );

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
        journalEntryLineDto.setId( line.getId() );
        journalEntryLineDto.setDebit( line.getDebit() );
        journalEntryLineDto.setCredit( line.getCredit() );
        journalEntryLineDto.setDescription( line.getDescription() );

        return journalEntryLineDto;
    }

    @Override
    public JournalEntryLine toLineEntity(JournalEntryDto.JournalEntryLineDto lineDto) {
        if ( lineDto == null ) {
            return null;
        }

        JournalEntryLine journalEntryLine = new JournalEntryLine();

        journalEntryLine.setAccount( map( lineDto.getAccountId() ) );
        journalEntryLine.setId( lineDto.getId() );
        journalEntryLine.setDescription( lineDto.getDescription() );
        journalEntryLine.setDebit( lineDto.getDebit() );
        journalEntryLine.setCredit( lineDto.getCredit() );

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
