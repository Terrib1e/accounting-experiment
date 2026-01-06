import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { WorkflowService } from '../../../../core/services/workflow.service';
import { ContactService } from '../../../../core/services/contact.service';
import { JobService } from '../../../../core/services/job.service';
import { Workflow } from '../../../../core/models/workflow.model';
import { Contact } from '../../../../core/models/contact.model';
import { Job } from '../../../../core/models/job.model';

export interface JobFormDialogData {
  job?: Job;
}

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
export class JobFormComponent implements OnInit {
  form!: FormGroup;
  workflows: Workflow[] = [];
  contacts: Contact[] = [];
  isEditing = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<JobFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: JobFormDialogData,
    private workflowService: WorkflowService,
    private contactService: ContactService,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.isEditing = !!this.data?.job;
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: [this.data?.job?.name || '', Validators.required],
      workflowId: [this.data?.job?.workflowId || '', Validators.required],
      contactId: [this.data?.job?.contactId || '', Validators.required],
      dueDate: [this.data?.job?.dueDate ? new Date(this.data.job.dueDate) : null],
      assigneeId: [this.data?.job?.assigneeId || '']
    });
  }

  loadData(): void {
    this.workflowService.getAllWorkflows().subscribe(wfs => this.workflows = wfs);
    this.contactService.getContacts().subscribe(response => this.contacts = response.data.content);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const formValue = this.form.value;

    const jobPayload: any = {
      name: formValue.name,
      workflowId: formValue.workflowId,
      contactId: formValue.contactId,
      dueDate: formValue.dueDate ? formValue.dueDate.toISOString().split('T')[0] : null,
      assigneeId: formValue.assigneeId || null
    };

    if (this.isEditing && this.data.job) {
      // Update not implemented yet, just close
      this.dialogRef.close(null);
    } else {
      this.jobService.createJob(jobPayload).subscribe({
        next: (created) => {
          this.isLoading = false;
          this.dialogRef.close(created);
        },
        error: (err) => {
          console.error('Failed to create job', err);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
