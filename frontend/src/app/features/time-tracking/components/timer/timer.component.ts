import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, interval, takeUntil } from 'rxjs';
import { TimeEntryService } from '../../services/time-entry.service';
import { TimeEntry, TimerRequest } from '../../models/time-entry.model';

interface QuickJob {
  id: string;
  name: string;
}

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="timer-widget">
      <!-- Timer Not Running -->
      <div class="timer-start" *ngIf="!runningTimer">
        <button mat-icon-button
                [matMenuTriggerFor]="startMenu"
                matTooltip="Start Timer"
                class="start-button">
          <mat-icon>play_circle</mat-icon>
        </button>

        <mat-menu #startMenu="matMenu" class="timer-start-menu">
          <div class="menu-content" (click)="$event.stopPropagation()">
            <div class="menu-header">
              <mat-icon>timer</mat-icon>
              Start Timer
            </div>
            <div class="menu-body">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>What are you working on?</mat-label>
                <input matInput [(ngModel)]="newTimerDescription" placeholder="Task description...">
              </mat-form-field>

              <div class="quick-jobs" *ngIf="recentJobs.length > 0">
                <span class="quick-label">Recent jobs:</span>
                <button mat-stroked-button
                        *ngFor="let job of recentJobs.slice(0, 3)"
                        (click)="startTimerForJob(job)"
                        class="quick-job-btn">
                  {{ job.name | slice:0:20 }}{{ job.name.length > 20 ? '...' : '' }}
                </button>
              </div>

              <button mat-raised-button
                      color="primary"
                      (click)="startTimer()"
                      [disabled]="!newTimerDescription"
                      class="start-btn">
                <mat-icon>play_arrow</mat-icon>
                Start
              </button>
            </div>
          </div>
        </mat-menu>
      </div>

      <!-- Timer Running -->
      <div class="timer-running" *ngIf="runningTimer">
        <div class="timer-display" [matMenuTriggerFor]="runningMenu">
          <div class="timer-time">{{ timerElapsed }}</div>
          <div class="timer-task">{{ runningTimer.description | slice:0:25 }}{{ runningTimer.description.length > 25 ? '...' : '' }}</div>
        </div>

        <button mat-icon-button
                (click)="stopTimer()"
                matTooltip="Stop Timer"
                class="stop-button">
          <mat-icon>stop_circle</mat-icon>
        </button>

        <mat-menu #runningMenu="matMenu">
          <div class="running-info" (click)="$event.stopPropagation()">
            <div class="info-row">
              <mat-icon>description</mat-icon>
              <span>{{ runningTimer.description }}</span>
            </div>
            <div class="info-row" *ngIf="runningTimer.jobName">
              <mat-icon>work</mat-icon>
              <span>{{ runningTimer.jobName }}</span>
            </div>
            <div class="info-row" *ngIf="runningTimer.contactName">
              <mat-icon>person</mat-icon>
              <span>{{ runningTimer.contactName }}</span>
            </div>
            <div class="elapsed-large">{{ timerElapsed }}</div>
          </div>
        </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    .timer-widget {
      display: flex;
      align-items: center;
    }

    .start-button {
      color: #667eea;
    }

    .start-button mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .timer-running {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 4px 8px 4px 16px;
      border-radius: 24px;
      cursor: pointer;
    }

    .timer-display {
      display: flex;
      flex-direction: column;
      color: white;
    }

    .timer-time {
      font-size: 16px;
      font-weight: 600;
      font-family: 'Roboto Mono', monospace;
    }

    .timer-task {
      font-size: 11px;
      opacity: 0.9;
    }

    .stop-button {
      color: white;
    }

    .stop-button:hover {
      background: rgba(255,255,255,0.2);
    }

    ::ng-deep .timer-start-menu {
      min-width: 320px !important;
    }

    .menu-content {
      padding: 0;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 500;
    }

    .menu-body {
      padding: 16px;
    }

    .full-width {
      width: 100%;
    }

    .quick-jobs {
      margin: 12px 0;
    }

    .quick-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }

    .quick-job-btn {
      font-size: 12px;
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .start-btn {
      width: 100%;
      margin-top: 8px;
    }

    .running-info {
      padding: 16px;
      min-width: 250px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      color: #333;
    }

    .info-row mat-icon {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .elapsed-large {
      font-size: 32px;
      font-weight: 600;
      font-family: 'Roboto Mono', monospace;
      text-align: center;
      margin-top: 16px;
      color: #667eea;
    }
  `]
})
export class TimerComponent implements OnInit, OnDestroy {
  runningTimer: TimeEntry | null = null;
  timerElapsed: string = '00:00:00';
  newTimerDescription: string = '';
  recentJobs: QuickJob[] = [];

  private destroy$ = new Subject<void>();

  constructor(private timeEntryService: TimeEntryService) {}

  ngOnInit(): void {
    this.loadRecentJobs();
    this.setupTimerSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecentJobs(): void {
    fetch('/api/jobs').then(res => res.json()).then(data => {
      this.recentJobs = (data.data || []).slice(0, 5).map((j: any) => ({ id: j.id, name: j.name }));
    }).catch(() => {});
  }

  private setupTimerSubscription(): void {
    this.timeEntryService.runningTimer$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(timer => {
      this.runningTimer = timer;
    });

    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.runningTimer?.timerStartedAt) {
        const started = new Date(this.runningTimer.timerStartedAt).getTime();
        const now = Date.now();
        const seconds = Math.floor((now - started) / 1000);
        this.timerElapsed = this.formatSeconds(seconds);
      }
    });
  }

  private formatSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startTimer(): void {
    if (!this.newTimerDescription) return;

    const request: TimerRequest = {
      description: this.newTimerDescription
    };

    this.timeEntryService.startTimer(request).subscribe(() => {
      this.newTimerDescription = '';
    });
  }

  startTimerForJob(job: QuickJob): void {
    const request: TimerRequest = {
      description: `Working on ${job.name}`,
      jobId: job.id
    };

    this.timeEntryService.startTimer(request).subscribe(() => {
      this.newTimerDescription = '';
    });
  }

  stopTimer(): void {
    this.timeEntryService.stopTimer().subscribe();
  }
}
