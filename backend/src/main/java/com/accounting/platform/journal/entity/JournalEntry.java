package com.accounting.platform.journal.entity;

import com.accounting.platform.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "journal_entries", indexes = {
    @Index(name = "idx_entry_date", columnList = "entry_date")
})
public class JournalEntry extends BaseEntity {

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JournalEntryStatus status = JournalEntryStatus.DRAFT;

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<JournalEntryLine> lines = new ArrayList<>();

    public void addLine(JournalEntryLine line) {
        lines.add(line);
        line.setJournalEntry(this);
    }

    public void removeLine(JournalEntryLine line) {
        lines.remove(line);
        line.setJournalEntry(null);
    }
}
