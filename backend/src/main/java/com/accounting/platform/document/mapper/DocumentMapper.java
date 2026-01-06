package com.accounting.platform.document.mapper;

import com.accounting.platform.document.dto.DocumentDto;
import com.accounting.platform.document.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.name", target = "jobName")
    @Mapping(source = "contact.id", target = "contactId")
    @Mapping(source = "contact.name", target = "contactName")
    DocumentDto toDto(Document document);
}
