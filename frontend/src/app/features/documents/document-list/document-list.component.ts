import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../../core/services/document.service';
import { Document } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {
  @Input() jobId?: string;
  @Input() contactId?: string;
  @Output() deleted = new EventEmitter<string>();

  documents: Document[] = [];
  displayedColumns = ['name', 'category', 'size', 'uploadedAt', 'actions'];
  isLoading = false;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;

    if (this.jobId) {
      this.documentService.getDocumentsForJob(this.jobId).subscribe({
        next: (docs) => {
          this.documents = docs;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load documents', err);
          this.isLoading = false;
        }
      });
    } else if (this.contactId) {
      this.documentService.getDocumentsForContact(this.contactId).subscribe({
        next: (docs) => {
          this.documents = docs;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load documents', err);
          this.isLoading = false;
        }
      });
    }
  }

  download(doc: Document): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.originalFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download failed', err)
    });
  }

  delete(doc: Document): void {
    if (confirm(`Delete "${doc.originalFilename}"?`)) {
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== doc.id);
          this.deleted.emit(doc.id);
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  addDocument(doc: Document): void {
    this.documents = [doc, ...this.documents];
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileIcon(contentType: string): string {
    if (contentType?.includes('pdf')) return 'picture_as_pdf';
    if (contentType?.includes('image')) return 'image';
    if (contentType?.includes('spreadsheet') || contentType?.includes('excel')) return 'table_chart';
    if (contentType?.includes('word') || contentType?.includes('document')) return 'article';
    return 'description';
  }
}
