package com.accounting.platform.document.mapper;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.document.dto.DocumentDto;
import com.accounting.platform.document.entity.Document;
import com.accounting.platform.workflow.entity.Job;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-08T22:37:17-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Amazon.com Inc.)"
)
@Component
public class DocumentMapperImpl implements DocumentMapper {

    @Override
    public DocumentDto toDto(Document document) {
        if ( document == null ) {
            return null;
        }

        DocumentDto documentDto = new DocumentDto();

        documentDto.setJobId( documentJobId( document ) );
        documentDto.setJobName( documentJobName( document ) );
        documentDto.setContactId( documentContactId( document ) );
        documentDto.setContactName( documentContactName( document ) );
        documentDto.setId( document.getId() );
        documentDto.setFilename( document.getFilename() );
        documentDto.setOriginalFilename( document.getOriginalFilename() );
        documentDto.setContentType( document.getContentType() );
        documentDto.setFileSize( document.getFileSize() );
        documentDto.setDescription( document.getDescription() );
        documentDto.setCategory( document.getCategory() );
        documentDto.setUploadedBy( document.getUploadedBy() );
        documentDto.setCreatedAt( document.getCreatedAt() );

        return documentDto;
    }

    private UUID documentJobId(Document document) {
        if ( document == null ) {
            return null;
        }
        Job job = document.getJob();
        if ( job == null ) {
            return null;
        }
        UUID id = job.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String documentJobName(Document document) {
        if ( document == null ) {
            return null;
        }
        Job job = document.getJob();
        if ( job == null ) {
            return null;
        }
        String name = job.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private UUID documentContactId(Document document) {
        if ( document == null ) {
            return null;
        }
        Contact contact = document.getContact();
        if ( contact == null ) {
            return null;
        }
        UUID id = contact.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String documentContactName(Document document) {
        if ( document == null ) {
            return null;
        }
        Contact contact = document.getContact();
        if ( contact == null ) {
            return null;
        }
        String name = contact.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
