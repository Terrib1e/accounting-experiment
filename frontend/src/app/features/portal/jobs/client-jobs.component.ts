import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Job {
  id: string;
  name: string;
  workflowName: string;
  currentStageName: string;
  currentStageOrder: number;
  totalStages: number;
  dueDate: string;
  description?: string;
}

@Component({
  selector: 'app-client-jobs',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">My Work</h1>
          <p class="text-slate-500 font-medium">Track the progress of your active projects and engagements</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Filter Tabs -->
          <div class="flex bg-slate-100 rounded-xl p-1">
            <button (click)="setFilter('active')"
                    [class]="filterStatus === 'active' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              Active
            </button>
            <button (click)="setFilter('all')"
                    [class]="filterStatus === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              All Work
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Banner -->
      <div class="premium-card p-6 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 border-none relative overflow-hidden">
        <div class="absolute -right-10 -top-10 text-white/5">
          <span class="material-icons !text-[180px]">engineering</span>
        </div>
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <span class="material-icons text-white text-3xl">work</span>
            </div>
            <div>
              <p class="text-white/80 text-sm font-medium">Total Active Projects</p>
              <p class="text-4xl font-bold text-white">{{ activeJobsCount }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <div class="text-center">
              <p class="text-white/60 text-xs font-semibold uppercase tracking-wider">In Progress</p>
              <p class="text-2xl font-bold text-white">{{ inProgressCount }}</p>
            </div>
            <div class="h-10 w-px bg-white/20"></div>
            <div class="text-center">
              <p class="text-white/60 text-xs font-semibold uppercase tracking-wider">Due Soon</p>
              <p class="text-2xl font-bold text-amber-300">{{ dueSoonCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="h-52 bg-slate-100 rounded-2xl animate-pulse"></div>
        <div class="h-52 bg-slate-100 rounded-2xl animate-pulse"></div>
        <div class="h-52 bg-slate-100 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Job Cards Grid -->
      <div *ngIf="!loading && filteredJobs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let job of filteredJobs"
             class="premium-card p-6 bg-white hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                {{ job.name }}
              </h3>
              <p class="text-xs text-slate-500 font-medium mt-0.5">{{ job.workflowName }}</p>
            </div>
            <div [class]="getDueDateClass(job)" class="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
              <span class="material-icons text-sm">schedule</span>
              <span>{{ job.dueDate | date:'MMM d' }}</span>
            </div>
          </div>

          <!-- Progress Section -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
              <span class="text-xs font-semibold text-slate-600">{{ getProgressPercent(job) }}%</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                   [style.width.%]="getProgressPercent(job)"></div>
            </div>
          </div>

          <!-- Current Stage -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <span class="material-icons text-primary-600 text-sm">flag</span>
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Stage</p>
                <p class="text-sm font-semibold text-slate-800">{{ job.currentStageName || 'Not Started' }}</p>
              </div>
            </div>
            <button class="h-8 w-8 rounded-lg bg-slate-100 hover:bg-primary-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <span class="material-icons text-slate-500 hover:text-primary-600 text-lg">chevron_right</span>
            </button>
          </div>

          <!-- Stage Timeline (Mini) -->
          <div class="mt-4 pt-4 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <div *ngFor="let stage of getStageIndicators(job); let i = index"
                   class="flex flex-col items-center flex-1">
                <div [class]="getStageIndicatorClass(stage, i, job)"
                     class="h-3 w-3 rounded-full transition-all"></div>
                <div *ngIf="i < getStageIndicators(job).length - 1"
                     class="flex-1 h-0.5 bg-slate-200 absolute"></div>
              </div>
            </div>
            <p class="text-[10px] text-slate-400 text-center mt-2">
              Stage {{ job.currentStageOrder || 1 }} of {{ job.totalStages || 1 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredJobs.length === 0" class="premium-card p-12 text-center bg-white">
        <div class="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <span class="material-icons text-slate-400 text-4xl">work_off</span>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">No Active Work</h3>
        <p class="text-slate-500 max-w-md mx-auto">
          {{ filterStatus === 'active' ? 'You don\\'t have any active projects at the moment. All completed work will appear in the "All Work" tab.' : 'No work history found for your account.' }}
        </p>
      </div>
    </div>
  `
})
export class ClientJobsComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  filterStatus: 'active' | 'all' = 'active';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Job[]>(`${environment.apiUrl}/portal/jobs`).subscribe({
      next: (data) => {
        this.jobs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load jobs', err);
        this.loading = false;
      }
    });
  }

  get filteredJobs(): Job[] {
    if (this.filterStatus === 'active') {
      return this.jobs.filter(j => j.currentStageName && !this.isCompleted(j));
    }
    return this.jobs;
  }

  get activeJobsCount(): number {
    return this.jobs.filter(j => !this.isCompleted(j)).length;
  }

  get inProgressCount(): number {
    return this.jobs.filter(j => j.currentStageName && !this.isCompleted(j)).length;
  }

  get dueSoonCount(): number {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return this.jobs.filter(j => {
      if (!j.dueDate) return false;
      const due = new Date(j.dueDate);
      return due <= weekFromNow && due >= new Date();
    }).length;
  }

  setFilter(status: 'active' | 'all'): void {
    this.filterStatus = status;
  }

  isCompleted(job: Job): boolean {
    return job.currentStageOrder >= job.totalStages && job.totalStages > 0;
  }

  isOverdue(job: Job): boolean {
    if (!job.dueDate) return false;
    return new Date(job.dueDate) < new Date();
  }

  isDueSoon(job: Job): boolean {
    if (!job.dueDate) return false;
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const due = new Date(job.dueDate);
    return due <= weekFromNow && due >= new Date();
  }

  getProgressPercent(job: Job): number {
    if (!job.totalStages || job.totalStages === 0) return 0;
    return Math.round(((job.currentStageOrder || 0) / job.totalStages) * 100);
  }

  getDueDateClass(job: Job): string {
    if (this.isOverdue(job)) return 'bg-red-100 text-red-700';
    if (this.isDueSoon(job)) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  }

  getStageIndicators(job: Job): number[] {
    const total = Math.min(job.totalStages || 4, 6); // Max 6 indicators
    return Array(total).fill(0).map((_, i) => i + 1);
  }

  getStageIndicatorClass(stage: number, index: number, job: Job): string {
    const current = job.currentStageOrder || 1;
    if (index + 1 < current) return 'bg-accent-500'; // Completed
    if (index + 1 === current) return 'bg-primary-500 ring-4 ring-primary-100'; // Current
    return 'bg-slate-200'; // Future
  }
}
