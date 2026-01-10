import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TimeEntryService } from '../../services/time-entry.service';
import { TimeEntry, CreateTimeEntryRequest } from '../../models/time-entry.model';

interface DialogData {
  mode: 'create' | 'edit';
  entry?: TimeEntry;
}

interface SelectOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-time-entry-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  template: `
    <div class="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-2xl max-w-lg w-full mx-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
            <mat-icon class="text-xl">schedule</mat-icon>
          </div>
          <h2 class="text-lg font-semibold text-slate-900 m-0">
            {{ data.mode === 'create' ? 'New Time Entry' : 'Edit Time Entry' }}
          </h2>
        </div>
        <button mat-icon-button (click)="onCancel()" class="text-slate-400 hover:text-slate-600 -mr-2">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <mat-dialog-content class="!p-6 overflow-y-auto flex-1 custom-scrollbar">
        <form class="flex flex-col gap-5">
          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700">Description <span class="text-red-500">*</span></label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              rows="3"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 placeholder:text-slate-400 resize-none transition-all duration-200"
              placeholder="What did you work on?"
              required></textarea>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <!-- Date -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Date <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  [matDatepicker]="picker"
                  [(ngModel)]="entryDate"
                  name="date"
                  class="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 transition-all duration-200 cursor-pointer"
                  (click)="picker.open()"
                  readonly
                  required>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <mat-icon class="text-lg leading-none !w-5 !h-5">calendar_today</mat-icon>
                </div>
                <mat-datepicker #picker></mat-datepicker>
              </div>
            </div>

            <!-- Duration -->
            <div class="flex flex-col gap-1.5">
               <label class="text-sm font-medium text-slate-700">Duration <span class="text-red-500">*</span></label>
               <div class="flex items-center gap-2">
                 <div class="relative flex-1">
                   <input
                     type="number"
                     [(ngModel)]="hours"
                     name="hours"
                     min="0"
                     max="24"
                     class="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 transition-all duration-200">
                   <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">h</span>
                 </div>
                 <div class="relative flex-1">
                   <input
                     type="number"
                     [(ngModel)]="minutes"
                     name="minutes"
                     min="0"
                     max="59"
                     class="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 transition-all duration-200">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">m</span>
                 </div>
               </div>
            </div>
          </div>

          <!-- Job & Client Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Job <span class="text-slate-400 font-normal">(Optional)</span></label>
              <div class="relative">
                <select
                  [(ngModel)]="formData.jobId"
                  name="jobId"
                  class="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 appearance-none transition-all duration-200">
                  <option value="">-- No Job --</option>
                  <option *ngFor="let job of jobs" [value]="job.id">{{ job.name }}</option>
                </select>
                <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</mat-icon>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Client <span class="text-slate-400 font-normal">(Optional)</span></label>
               <div class="relative">
                <select
                  [(ngModel)]="formData.contactId"
                  name="contactId"
                  class="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 appearance-none transition-all duration-200">
                  <option value="">-- No Client --</option>
                  <option *ngFor="let contact of contacts" [value]="contact.id">{{ contact.name }}</option>
                </select>
                <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</mat-icon>
              </div>
            </div>
          </div>

          <div class="h-px bg-slate-100 my-1"></div>

          <!-- Financials -->
          <div class="flex items-start justify-between bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div class="flex flex-col gap-3">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative">
                  <input type="checkbox" [(ngModel)]="formData.billable" name="billable" class="peer sr-only">
                  <div class="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </div>
                <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Billable Entry</span>
              </label>

              <div *ngIf="formData.billable" class="flex items-center gap-2 pl-1 animate-fade-in">
                <span class="text-sm text-slate-500">Rate:</span>
                <div class="relative w-24">
                  <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    [(ngModel)]="formData.billableRate"
                    name="billableRate"
                    step="0.01"
                    class="w-full pl-6 pr-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:border-primary-500">
                  <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">/hr</span>
                </div>
              </div>
            </div>

            <div class="text-right" *ngIf="formData.billable">
              <div class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Value</div>
              <div class="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
                {{ calculatedAmount | currency }}
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 rounded-b-xl">
        <div class="text-xs text-slate-400 italic">
          * Required fields
        </div>
        <div class="flex items-center gap-3">
          <button
            mat-button
            (click)="onCancel()"
            class="!text-slate-600 hover:!bg-slate-200 !rounded-lg !px-4 !font-medium">
            Cancel
          </button>
          <button
            mat-flat-button
            color="primary"
            (click)="onSave()"
            [disabled]="!isValid()"
            class="!rounded-lg !px-6 !py-1 !font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:shadow-none">
            {{ data.mode === 'create' ? 'Save Entry' : 'Update Entry' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    /* Make datepicker popup match theme */
    ::ng-deep .mat-datepicker-content {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e2e8f0;
    }

    /* Custom Scrollbar for content */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class TimeEntryFormComponent implements OnInit {
  formData: CreateTimeEntryRequest = {
    description: '',
    date: new Date().toISOString().split('T')[0],
    billable: true,
    billableRate: 150 // Default rate
  };

  entryDate: Date = new Date();
  hours: number = 0;
  minutes: number = 0;

  jobs: SelectOption[] = [];
  contacts: SelectOption[] = [];

  constructor(
    private dialogRef: MatDialogRef<TimeEntryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private timeEntryService: TimeEntryService
  ) {}

  ngOnInit(): void {
    this.loadOptions();

    if (this.data.entry) {
      this.populateForm(this.data.entry);
    }
  }

  private loadOptions(): void {
    // Load jobs and contacts for dropdowns
    // In a real app, these would come from their respective services
    fetch('/api/jobs').then(res => res.json()).then(data => {
      this.jobs = (data.data || []).map((j: any) => ({ id: j.id, name: j.name }));
    }).catch(() => {});

    fetch('/api/contacts').then(res => res.json()).then(data => {
      this.contacts = (data.data || []).map((c: any) => ({ id: c.id, name: c.name }));
    }).catch(() => {});
  }

  private populateForm(entry: TimeEntry): void {
    this.formData = {
      description: entry.description,
      date: entry.date,
      jobId: entry.jobId,
      contactId: entry.contactId,
      billable: entry.billable,
      billableRate: entry.billableRate
    };

    this.entryDate = new Date(entry.date);
    this.hours = Math.floor(entry.durationMinutes / 60);
    this.minutes = entry.durationMinutes % 60;
  }

  get totalDurationMinutes(): number {
    return (this.hours * 60) + this.minutes;
  }

  get calculatedAmount(): number {
    if (!this.formData.billableRate) return 0;
    return this.timeEntryService.calculateBillableAmount(this.totalDurationMinutes, this.formData.billableRate);
  }

  isValid(): boolean {
    return !!this.formData.description && this.totalDurationMinutes > 0;
  }

  onSave(): void {
    if (!this.isValid()) return;

    const request: CreateTimeEntryRequest = {
      ...this.formData,
      date: this.entryDate.toISOString().split('T')[0],
      durationMinutes: this.totalDurationMinutes
    };

    if (this.data.mode === 'edit' && this.data.entry?.id) {
      this.timeEntryService.updateTimeEntry(this.data.entry.id, request).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Failed to update time entry', err)
      });
    } else {
      this.timeEntryService.createTimeEntry(request).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Failed to create time entry', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
