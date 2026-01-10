package com.accounting.platform.timetracking.mapper;

import com.accounting.platform.timetracking.dto.TimeEntryDto;
import com.accounting.platform.timetracking.entity.TimeEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TimeEntryMapper {

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobName", source = "job.name")
    @Mapping(target = "contactId", source = "contact.id")
    @Mapping(target = "contactName", source = "contact.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", expression = "java(entity.getUser() != null ? entity.getUser().getFirstName() + \" \" + entity.getUser().getLastName() : null)")
    @Mapping(target = "formattedDuration", expression = "java(entity.getFormattedDuration())")
    @Mapping(target = "invoiceId", source = "invoice.id")
    TimeEntryDto toDto(TimeEntry entity);

    List<TimeEntryDto> toDtoList(List<TimeEntry> entities);

    @Mapping(target = "job", ignore = true)
    @Mapping(target = "contact", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateFromDto(TimeEntryDto dto, @MappingTarget TimeEntry entity);
}
