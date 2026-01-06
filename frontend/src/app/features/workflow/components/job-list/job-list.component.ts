import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JobService } from '../../../../core/services/job.service';
import { Job } from '../../../../core/models/job.model';
import { JobFormComponent } from '../job-form/job-form.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'client', 'workflow', 'stage', 'dueDate', 'actions'];
  dataSource: Job[] = [];

  constructor(
    private jobService: JobService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getAllJobs().subscribe(jobs => {
      this.dataSource = jobs;
    });
  }

  openCreateJobDialog(): void {
    const dialogRef = this.dialog.open(JobFormComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadJobs();
      }
    });
  }

  openEditJobDialog(job: Job): void {
    const dialogRef = this.dialog.open(JobFormComponent, {
      width: '500px',
      data: { job }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadJobs();
      }
    });
  }
}
