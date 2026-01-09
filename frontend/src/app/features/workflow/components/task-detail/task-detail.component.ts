import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../core/models/task.model';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  // If we are editing, we have data. If creating, we might have partial data (like jobId).
  task: Partial<Task> = {};
  isNew = true;

  constructor(
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task, jobId?: string },
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    if (this.data.task) {
        this.task = { ...this.data.task };
        this.isNew = false;
    } else if (this.data.jobId) {
        this.task.jobId = this.data.jobId;
        this.isNew = true;
    }
  }

  save(): void {
    if (this.isNew) {
        // Create
        // Note: In a real app we'd validate required fields
        if (!this.task.title || !this.task.jobId) return;

        this.jobService.createTask(this.task as Task).subscribe(created => {
            this.dialogRef.close(created);
        });
    } else {
        // Update (Not fully implemented in backend service yet besides status)
        // For now just close
        this.dialogRef.close(this.task);
    }
  }
}
