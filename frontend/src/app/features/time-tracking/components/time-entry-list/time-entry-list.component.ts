import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, interval, takeUntil } from 'rxjs';
import { TimeEntryService } from '../../services/time-entry.service';
import { TimeEntry, TimeEntrySummary } from '../../models/time-entry.model';
import { TimeEntryFormComponent } from '../time-entry-form/time-entry-form.component';

@Component({
  selector: 'app-time-entry-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="time-tracking-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Time Tracking</h1>
          <p class="subtitle">Track billable hours and generate invoices</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openNewEntry()">
            <mat-icon>add</mat-icon>
            New Entry
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards" *ngIf="summary">
        <div class="stat-card">
          <div class="stat-icon today">
            <mat-icon>today</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Today</span>
            <span class="stat-value">{{ formatDuration(summary.totalMinutesToday) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon week">
            <mat-icon>date_range</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">This Week</span>
            <span class="stat-value">{{ formatDuration(summary.totalMinutesThisWeek) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon billable">
            <mat-icon>attach_money</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Billable This Week</span>
            <span class="stat-value">{{ summary.billableAmountThisWeek | currency }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon month">
            <mat-icon>calendar_month</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">This Month</span>
            <span class="stat-value">{{ summary.billableAmountThisMonth | currency }}</span>
          </div>
        </div>
      </div>

      <!-- Running Timer Banner -->
      <div class="running-timer-banner" *ngIf="runningTimer">
        <div class="timer-info">
          <mat-icon class="pulse">timer</mat-icon>
          <div class="timer-details">
            <span class="timer-task">{{ runningTimer.description }}</span>
            <span class="timer-elapsed">{{ timerElapsed }}</span>
          </div>
        </div>
        <button mat-raised-button color="warn" (click)="stopTimer()">
          <mat-icon>stop</mat-icon>
          Stop Timer
        </button>
      </div>

      <!-- Time Entries Table -->
      <div class="table-container">
        <table mat-table [dataSource]="entries" class="time-entries-table">

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let entry">
              {{ entry.date | date:'MMM d, y' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let entry">
              <div class="description-cell">
                <span class="description-text">{{ entry.description }}</span>
                <span class="job-link" *ngIf="entry.jobName">{{ entry.jobName }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="client">
            <th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let entry">{{ entry.contactName || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>Duration</th>
            <td mat-cell *matCellDef="let entry">
              <span class="duration-badge">{{ entry.formattedDuration || formatDuration(entry.durationMinutes) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="billable">
            <th mat-header-cell *matHeaderCellDef>Billable</th>
            <td mat-cell *matCellDef="let entry">
              <mat-icon *ngIf="entry.billable" class="billable-yes">check_circle</mat-icon>
              <mat-icon *ngIf="!entry.billable" class="billable-no">remove_circle_outline</mat-icon>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let entry">
              <span *ngIf="entry.billable">{{ entry.billableAmount | currency }}</span>
              <span *ngIf="!entry.billable" class="na">-</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let entry">
              <span class="status-chip" [ngClass]="entry.status.toLowerCase()">
                {{ entry.status }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let entry">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="editEntry(entry)">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item (click)="duplicateEntry(entry)">
                  <mat-icon>content_copy</mat-icon>
                  <span>Duplicate</span>
                </button>
                <button mat-menu-item *ngIf="entry.status === 'DRAFT'" (click)="approveEntry(entry)">
                  <mat-icon>check</mat-icon>
                  <span>Approve</span>
                </button>
                <button mat-menu-item (click)="deleteEntry(entry)" class="delete-action">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="empty-state" *ngIf="entries.length === 0">
          <mat-icon>schedule</mat-icon>
          <h3>No time entries yet</h3>
          <p>Start tracking your billable hours</p>
          <button mat-raised-button color="primary" (click)="openNewEntry()">
            <mat-icon>add</mat-icon>
            Create First Entry
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .time-tracking-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .subtitle {
      margin: 4px 0 0;
      color: #666;
      font-size: 14px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.today { background: #e3f2fd; color: #1976d2; }
    .stat-icon.week { background: #f3e5f5; color: #7b1fa2; }
    .stat-icon.billable { background: #e8f5e9; color: #388e3c; }
    .stat-icon.month { background: #fff3e0; color: #f57c00; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 13px;
      color: #666;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .running-timer-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      color: white;
    }

    .timer-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .timer-info .pulse {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .timer-details {
      display: flex;
      flex-direction: column;
    }

    .timer-task {
      font-weight: 500;
      font-size: 16px;
    }

    .timer-elapsed {
      font-size: 24px;
      font-weight: 700;
      font-family: 'Roboto Mono', monospace;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .time-entries-table {
      width: 100%;
    }

    .description-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .description-text {
      font-weight: 500;
    }

    .job-link {
      font-size: 12px;
      color: #667eea;
    }

    .duration-badge {
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: 500;
      font-size: 13px;
    }

    .billable-yes { color: #4caf50; }
    .billable-no { color: #bdbdbd; }

    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-chip.draft { background: #fff3e0; color: #f57c00; }
    .status-chip.submitted { background: #e3f2fd; color: #1976d2; }
    .status-chip.approved { background: #e8f5e9; color: #388e3c; }
    .status-chip.billed { background: #f3e5f5; color: #7b1fa2; }
    .status-chip.written_off { background: #ffebee; color: #c62828; }

    .empty-state {
      padding: 64px;
      text-align: center;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #bdbdbd;
    }

    .empty-state h3 {
      margin: 16px 0 8px;
      color: #1a1a2e;
    }

    .na { color: #bdbdbd; }

    ::ng-deep .delete-action { color: #c62828 !important; }
  `]
})
export class TimeEntryListComponent implements OnInit, OnDestroy {
  entries: TimeEntry[] = [];
  summary: TimeEntrySummary | null = null;
  runningTimer: TimeEntry | null = null;
  timerElapsed: string = '00:00:00';

  displayedColumns = ['date', 'description', 'client', 'duration', 'billable', 'amount', 'status', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private timeEntryService: TimeEntryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupTimerSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.timeEntryService.getTimeEntries().subscribe(entries => {
      this.entries = entries;
    });

    this.timeEntryService.getSummary().subscribe(summary => {
      this.summary = summary;
      if (summary.runningTimer) {
        this.runningTimer = summary.runningTimer;
      }
    });
  }

  private setupTimerSubscription(): void {
    this.timeEntryService.runningTimer$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(timer => {
      this.runningTimer = timer;
    });

    // Update elapsed time every second
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

  formatDuration(minutes: number): string {
    return this.timeEntryService.formatDuration(minutes);
  }

  openNewEntry(): void {
    const dialogRef = this.dialog.open(TimeEntryFormComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Time entry created', 'Close', { duration: 3000 });
      }
    });
  }

  editEntry(entry: TimeEntry): void {
    const dialogRef = this.dialog.open(TimeEntryFormComponent, {
      width: '500px',
      data: { mode: 'edit', entry }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Time entry updated', 'Close', { duration: 3000 });
      }
    });
  }

  duplicateEntry(entry: TimeEntry): void {
    const dialogRef = this.dialog.open(TimeEntryFormComponent, {
      width: '500px',
      data: { mode: 'create', entry: { ...entry, id: undefined } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Time entry duplicated', 'Close', { duration: 3000 });
      }
    });
  }

  approveEntry(entry: TimeEntry): void {
    this.timeEntryService.approveTimeEntry(entry.id).subscribe(() => {
      this.loadData();
      this.snackBar.open('Time entry approved', 'Close', { duration: 3000 });
    });
  }

  deleteEntry(entry: TimeEntry): void {
    if (confirm('Are you sure you want to delete this time entry?')) {
      this.timeEntryService.deleteTimeEntry(entry.id).subscribe(() => {
        this.loadData();
        this.snackBar.open('Time entry deleted', 'Close', { duration: 3000 });
      });
    }
  }

  stopTimer(): void {
    this.timeEntryService.stopTimer().subscribe(() => {
      this.loadData();
      this.snackBar.open('Timer stopped', 'Close', { duration: 3000 });
    });
  }
}
