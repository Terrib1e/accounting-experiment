import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Job {
  id: string;
  name: string;
  workflowName: string;
  currentStageName: string;
  dueDate: string;
}

@Component({
  selector: 'app-client-jobs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-800">My Work</h2>
      <p class="text-gray-500">Track the progress of your active projects.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let job of jobs" class="hover:shadow-lg transition-shadow">
          <mat-card-header>
            <mat-card-title>{{ job.name }}</mat-card-title>
            <mat-card-subtitle>{{ job.workflowName }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="flex items-center justify-between text-sm">
              <span class="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                {{ job.currentStageName }}
              </span>
              <span *ngIf="job.dueDate" class="text-gray-500 flex items-center gap-1">
                <mat-icon class="text-sm !w-4 !h-4">calendar_today</mat-icon>
                {{ job.dueDate | date }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="jobs.length === 0" class="text-center py-12 text-gray-500">
        No active work found.
      </div>
    </div>
  `
})
export class ClientJobsComponent implements OnInit {
  jobs: Job[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Job[]>(`${environment.apiUrl}/portal/jobs`).subscribe({
      next: (data) => this.jobs = data,
      error: (err) => console.error('Failed to load jobs', err)
    });
  }
}
