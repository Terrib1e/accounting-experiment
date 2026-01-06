import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { JobService } from '../../../../core/services/job.service';
import { Job } from '../../../../core/models/job.model';
import { Task } from '../../../../core/models/task.model';
import { DocumentUploadComponent } from '../../../documents/document-upload/document-upload.component';
import { DocumentListComponent } from '../../../documents/document-list/document-list.component';
import { Document } from '../../../../core/models/document.model';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    DocumentUploadComponent,
    DocumentListComponent
  ],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent implements OnInit {
  @ViewChild('documentList') documentList?: DocumentListComponent;

  job: Job | null = null;
  tasks: Task[] = [];
  isLoading = true;
  newTaskTitle = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJob(jobId);
      this.loadTasks(jobId);
    }
  }

  loadJob(jobId: string): void {
    this.jobService.getAllJobs().subscribe(jobs => {
      this.job = jobs.find(j => j.id === jobId) || null;
      this.isLoading = false;
    });
  }

  loadTasks(jobId: string): void {
    this.jobService.getTasksByJob(jobId).subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  toggleTaskCompletion(task: Task): void {
    this.jobService.updateTaskStatus(task.id, !task.isCompleted).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex(t => t.id === updated.id);
        if (idx >= 0) this.tasks[idx] = updated;
      },
      error: (err) => console.error('Failed to update task', err)
    });
  }

  addTask(): void {
    if (!this.newTaskTitle.trim() || !this.job) return;

    const newTask: any = {
      title: this.newTaskTitle.trim(),
      jobId: this.job.id
    };

    this.jobService.createTask(newTask).subscribe({
      next: (created) => {
        this.tasks.push(created);
        this.newTaskTitle = '';
      },
      error: (err) => console.error('Failed to create task', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  get completedCount(): number {
    return this.tasks.filter(t => t.isCompleted).length;
  }

  onDocumentUploaded(doc: Document): void {
    this.documentList?.addDocument(doc);
  }
}
