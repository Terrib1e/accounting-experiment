import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpEventType } from '@angular/common/http';
import { DocumentService } from '../../../core/services/document.service';
import { Document, DOCUMENT_CATEGORIES } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent {
  @Input() jobId?: string;
  @Input() contactId?: string;
  @Output() uploaded = new EventEmitter<Document>();

  selectedFile: File | null = null;
  description = '';
  category = '';
  categories = DOCUMENT_CATEGORIES;
  uploading = false;
  uploadProgress = 0;
  dragOver = false;

  constructor(private documentService: DocumentService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  upload(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadProgress = 0;

    this.documentService.uploadDocument(
      this.selectedFile,
      this.jobId,
      this.contactId,
      this.description,
      this.category
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.selectedFile = null;
          this.description = '';
          this.category = '';
          if (event.body) {
            this.uploaded.emit(event.body);
          }
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.uploading = false;
      }
    });
  }

  clearFile(): void {
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
