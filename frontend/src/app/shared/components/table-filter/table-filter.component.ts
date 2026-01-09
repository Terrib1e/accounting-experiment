import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export interface FilterConfig {
  showSearch?: boolean;
  showStatus?: boolean;
  showDateRange?: boolean;
  showContact?: boolean;
  statusOptions?: { value: string; label: string }[];
  contacts?: { id: string; name: string }[];
  placeholder?: string;
}

export interface FilterState {
  search: string;
  status: string[];
  startDate: string | null;
  endDate: string | null;
  contactId: string | null;
}

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 animate-in">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Search Input -->
        <div *ngIf="config.showSearch !== false" class="flex-1 min-w-[200px]">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Search</label>
          <div class="relative">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input type="text"
                   [formControl]="searchControl"
                   [placeholder]="config.placeholder || 'Search...'"
                   class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
                          placeholder:text-slate-400 transition-all">
            <button *ngIf="searchControl.value"
                    (click)="searchControl.setValue('')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>
        </div>

        <!-- Status Multi-Select -->
        <div *ngIf="config.showStatus !== false && config.statusOptions?.length" class="min-w-[180px]">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
          <mat-form-field appearance="outline" class="w-full filter-field">
            <mat-select [formControl]="statusControl" multiple placeholder="All statuses">
              <mat-option *ngFor="let opt of config.statusOptions" [value]="opt.value">
                {{ opt.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Date Range -->
        <div *ngIf="config.showDateRange !== false" class="flex items-end gap-2">
          <div class="min-w-[140px]">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">From</label>
            <div class="relative">
              <input type="date"
                     [formControl]="startDateControl"
                     class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
                            transition-all">
            </div>
          </div>
          <div class="min-w-[140px]">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
            <div class="relative">
              <input type="date"
                     [formControl]="endDateControl"
                     class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
                            transition-all">
            </div>
          </div>
        </div>

        <!-- Contact/Customer Select -->
        <div *ngIf="config.showContact && config.contacts?.length" class="min-w-[180px]">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Customer/Vendor</label>
          <mat-form-field appearance="outline" class="w-full filter-field">
            <mat-select [formControl]="contactControl" placeholder="All">
              <mat-option [value]="null">All</mat-option>
              <mat-option *ngFor="let c of config.contacts" [value]="c.id">
                {{ c.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Clear Filters -->
        <button *ngIf="hasActiveFilters"
                (click)="clearFilters()"
                class="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800
                       hover:bg-slate-100 rounded-lg transition-all">
          <span class="material-icons text-lg">filter_alt_off</span>
          Clear
        </button>
      </div>

      <!-- Active Filter Chips -->
      <div *ngIf="hasActiveFilters" class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
        <span class="text-xs text-slate-400 font-medium mr-1 self-center">Active:</span>

        <div *ngIf="searchControl.value"
             class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
          <span class="material-icons text-sm">search</span>
          "{{ searchControl.value }}"
          <button (click)="searchControl.setValue('')" class="ml-1 hover:text-primary-900">
            <span class="material-icons text-sm">close</span>
          </button>
        </div>

        <div *ngFor="let status of statusControl.value"
             class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
          {{ getStatusLabel(status) }}
          <button (click)="removeStatus(status)" class="ml-1 hover:text-slate-900">
            <span class="material-icons text-sm">close</span>
          </button>
        </div>

        <div *ngIf="startDateControl.value || endDateControl.value"
             class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
          <span class="material-icons text-sm">date_range</span>
          {{ formatDateRange() }}
          <button (click)="clearDateRange()" class="ml-1 hover:text-slate-900">
            <span class="material-icons text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .filter-field {
      .mat-mdc-form-field-subscript-wrapper { display: none; }
      .mat-mdc-text-field-wrapper { padding: 0 !important; }
      .mat-mdc-form-field-infix { padding: 8px 0 !important; min-height: 40px !important; }
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #e2e8f0 !important;
      }
      &:hover .mdc-notched-outline__leading,
      &:hover .mdc-notched-outline__notch,
      &:hover .mdc-notched-outline__trailing {
        border-color: #cbd5e1 !important;
      }
    }
  `]
})
export class TableFilterComponent implements OnInit, OnDestroy {
  @Input() config: FilterConfig = {
    showSearch: true,
    showStatus: true,
    showDateRange: true,
    showContact: false,
    statusOptions: []
  };

  @Input() set initialFilters(value: Partial<FilterState>) {
    if (value) {
      if (value.search) this.searchControl.setValue(value.search, { emitEvent: false });
      if (value.status) this.statusControl.setValue(value.status, { emitEvent: false });
      if (value.startDate) this.startDateControl.setValue(value.startDate, { emitEvent: false });
      if (value.endDate) this.endDateControl.setValue(value.endDate, { emitEvent: false });
      if (value.contactId) this.contactControl.setValue(value.contactId, { emitEvent: false });
    }
  }

  @Output() filterChange = new EventEmitter<FilterState>();

  searchControl = new FormControl('');
  statusControl = new FormControl<string[]>([]);
  startDateControl = new FormControl<string | null>(null);
  endDateControl = new FormControl<string | null>(null);
  contactControl = new FormControl<string | null>(null);

  private destroy$ = new Subject<void>();

  get hasActiveFilters(): boolean {
    return !!(
      this.searchControl.value ||
      (this.statusControl.value && this.statusControl.value.length > 0) ||
      this.startDateControl.value ||
      this.endDateControl.value ||
      this.contactControl.value
    );
  }

  ngOnInit() {
    // Debounce search input
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.emitFilters());

    // Immediate emit for select changes
    this.statusControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.emitFilters());
    this.startDateControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.emitFilters());
    this.endDateControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.emitFilters());
    this.contactControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.emitFilters());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  emitFilters() {
    this.filterChange.emit({
      search: this.searchControl.value || '',
      status: this.statusControl.value || [],
      startDate: this.startDateControl.value,
      endDate: this.endDateControl.value,
      contactId: this.contactControl.value
    });
  }

  clearFilters() {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusControl.setValue([], { emitEvent: false });
    this.startDateControl.setValue(null, { emitEvent: false });
    this.endDateControl.setValue(null, { emitEvent: false });
    this.contactControl.setValue(null, { emitEvent: false });
    this.emitFilters();
  }

  getStatusLabel(value: string): string {
    const opt = this.config.statusOptions?.find(o => o.value === value);
    return opt?.label || value;
  }

  removeStatus(status: string) {
    const current = this.statusControl.value || [];
    this.statusControl.setValue(current.filter(s => s !== status));
  }

  clearDateRange() {
    this.startDateControl.setValue(null);
    this.endDateControl.setValue(null);
  }

  formatDateRange(): string {
    const start = this.startDateControl.value;
    const end = this.endDateControl.value;
    if (start && end) return `${start} → ${end}`;
    if (start) return `From ${start}`;
    if (end) return `Until ${end}`;
    return '';
  }
}
