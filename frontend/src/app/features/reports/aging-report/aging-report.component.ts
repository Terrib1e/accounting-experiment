import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, AgingReport, AgingBucket } from '../../../core/services/report.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-aging-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Aging Reports</h2>
          <p class="text-slate-500 mt-1">View outstanding receivables and payables by age.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button
              (click)="selectReportType('RECEIVABLES')"
              [class]="selectedType === 'RECEIVABLES' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all">
              <span class="material-icons text-base align-middle mr-1">trending_up</span>
              Receivables
            </button>
            <button
              (click)="selectReportType('PAYABLES')"
              [class]="selectedType === 'PAYABLES' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all">
              <span class="material-icons text-base align-middle mr-1">trending_down</span>
              Payables
            </button>
          </div>
        </div>
      </div>

      <!-- Date Filter -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div class="flex items-end gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">As Of Date</label>
            <input type="date" [(ngModel)]="asOfDate"
                   class="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
                          transition-all">
          </div>
          <app-button (onClick)="runReport()" [loading]="loading">Run Report</app-button>

          <!-- Export Buttons -->
          <div *ngIf="report" class="flex gap-2 ml-auto">
            <button (click)="exportPdf()"
                    [disabled]="exporting"
                    class="inline-flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50">
              <span class="material-icons text-base mr-1">picture_as_pdf</span>
              PDF
            </button>
            <button (click)="exportExcel()"
                    [disabled]="exporting"
                    class="inline-flex items-center px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50">
              <span class="material-icons text-base mr-1">table_chart</span>
              Excel
            </button>
          </div>
        </div>
      </div>

      <!-- Report Content -->
      <div *ngIf="report" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Outstanding</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ report.totalOutstanding | currency }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Items</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ report.totalCount }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Report Type</p>
            <p class="text-2xl font-bold mt-1" [class]="report.reportType === 'RECEIVABLES' ? 'text-emerald-600' : 'text-amber-600'">
              {{ report.reportType === 'RECEIVABLES' ? 'AR' : 'AP' }}
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">As Of</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ report.reportDate | date:'MMM d' }}</p>
          </div>
        </div>

        <!-- Aging Buckets Visualization -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Aging Distribution</h3>
          <div class="space-y-3">
            <div *ngFor="let bucket of report.buckets" class="flex items-center gap-4">
              <div class="w-24 text-sm font-medium text-slate-600">{{ bucket.label }}</div>
              <div class="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                     [style.width.%]="getPercentage(bucket.amount)"
                     [ngClass]="{
                       'bg-emerald-500': bucket.label === 'Current',
                       'bg-yellow-500': bucket.label === '1-30 Days',
                       'bg-orange-500': bucket.label === '31-60 Days',
                       'bg-red-400': bucket.label === '61-90 Days',
                       'bg-red-600': bucket.label === '90+ Days'
                     }">
                </div>
              </div>
              <div class="w-28 text-right text-sm font-semibold text-slate-900">{{ bucket.amount | currency }}</div>
              <div class="w-16 text-right text-sm text-slate-500">({{ bucket.count }})</div>
            </div>
          </div>
        </div>

        <!-- Detailed Table by Bucket -->
        <div *ngFor="let bucket of report.buckets" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button (click)="toggleBucket(bucket.label)"
                  class="w-full flex items-center justify-between px-6 py-4 bg-slate-50/80 hover:bg-slate-100 transition-colors">
            <div class="flex items-center gap-3">
              <span class="material-icons text-slate-400">{{ expandedBuckets[bucket.label] ? 'expand_less' : 'expand_more' }}</span>
              <span class="font-semibold text-slate-900">{{ bucket.label }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-700': bucket.label === 'Current',
                      'bg-yellow-100 text-yellow-700': bucket.label === '1-30 Days',
                      'bg-orange-100 text-orange-700': bucket.label === '31-60 Days',
                      'bg-red-100 text-red-700': bucket.label === '61-90 Days' || bucket.label === '90+ Days'
                    }">
                {{ bucket.count }} item{{ bucket.count === 1 ? '' : 's' }}
              </span>
            </div>
            <span class="font-bold text-slate-900">{{ bucket.amount | currency }}</span>
          </button>

          <div *ngIf="expandedBuckets[bucket.label] && bucket.details.length > 0">
            <table class="min-w-full divide-y divide-slate-200">
              <thead>
                <tr class="bg-slate-50/50">
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {{ report.reportType === 'RECEIVABLES' ? 'Customer' : 'Vendor' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Document</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Days</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let line of bucket.details" class="hover:bg-primary-50/30 transition-colors">
                  <td class="px-6 py-3 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-7 w-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold mr-2">
                        {{ line.contactName.charAt(0) }}
                      </div>
                      <span class="text-sm font-medium text-slate-900">{{ line.contactName }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm text-primary-600 font-medium">{{ line.documentNumber }}</td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm text-slate-500">{{ line.documentDate | date:'MMM d, yyyy' }}</td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm text-slate-500">{{ line.dueDate | date:'MMM d, yyyy' }}</td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm text-center">
                    <span [ngClass]="{
                      'text-emerald-600': line.daysOverdue <= 0,
                      'text-yellow-600': line.daysOverdue > 0 && line.daysOverdue <= 30,
                      'text-orange-600': line.daysOverdue > 30 && line.daysOverdue <= 60,
                      'text-red-600': line.daysOverdue > 60
                    }" class="font-semibold">
                      {{ line.daysOverdue <= 0 ? 'Current' : line.daysOverdue + 'd' }}
                    </span>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm text-right font-semibold text-slate-900">
                    {{ line.amount | currency:line.currency }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="expandedBuckets[bucket.label] && bucket.details.length === 0" class="px-6 py-8 text-center text-slate-400">
            No items in this bucket
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!report && !loading" class="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
        <div class="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <span class="material-icons text-4xl text-slate-400">assessment</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">Run an Aging Report</h3>
        <p class="text-slate-500 max-w-md mx-auto">Select a report type and date, then click "Run Report" to view outstanding balances grouped by age.</p>
      </div>
    </div>
  `
})
export class AgingReportComponent implements OnInit {
  selectedType: 'RECEIVABLES' | 'PAYABLES' = 'RECEIVABLES';
  asOfDate: string = new Date().toISOString().split('T')[0];
  report: AgingReport | null = null;
  loading = false;
  exporting = false;
  expandedBuckets: Record<string, boolean> = {};

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.runReport();
  }

  selectReportType(type: 'RECEIVABLES' | 'PAYABLES') {
    this.selectedType = type;
    this.report = null;
    this.runReport();
  }

  runReport() {
    this.loading = true;
    const observable = this.selectedType === 'RECEIVABLES'
      ? this.reportService.getReceivablesAging(this.asOfDate)
      : this.reportService.getPayablesAging(this.asOfDate);

    observable.subscribe({
      next: (res: { data: AgingReport }) => {
        this.report = res.data;
        this.loading = false;
        // Auto-expand buckets with items
        this.expandedBuckets = {};
        this.report.buckets.forEach(b => {
          if (b.count > 0) this.expandedBuckets[b.label] = true;
        });
      },
      error: (err) => {
        console.error('Error loading aging report:', err);
        this.loading = false;
      }
    });
  }

  toggleBucket(label: string) {
    this.expandedBuckets[label] = !this.expandedBuckets[label];
  }

  getPercentage(amount: number): number {
    if (!this.report || this.report.totalOutstanding === 0) return 0;
    return (amount / this.report.totalOutstanding) * 100;
  }

  exportPdf() {
    this.exporting = true;
    const observable = this.selectedType === 'RECEIVABLES'
      ? this.reportService.exportReceivablesAgingPdf(this.asOfDate)
      : this.reportService.exportPayablesAgingPdf(this.asOfDate);

    const filename = this.selectedType === 'RECEIVABLES' ? 'ar-aging.pdf' : 'ap-aging.pdf';

    observable.subscribe({
      next: (blob) => {
        this.downloadFile(blob, filename);
        this.exporting = false;
      },
      error: (err) => {
        console.error('Error exporting PDF:', err);
        this.exporting = false;
      }
    });
  }

  exportExcel() {
    this.exporting = true;
    const observable = this.selectedType === 'RECEIVABLES'
      ? this.reportService.exportReceivablesAgingExcel(this.asOfDate)
      : this.reportService.exportPayablesAgingExcel(this.asOfDate);

    const filename = this.selectedType === 'RECEIVABLES' ? 'ar-aging.xlsx' : 'ap-aging.xlsx';

    observable.subscribe({
      next: (blob) => {
        this.downloadFile(blob, filename);
        this.exporting = false;
      },
      error: (err) => {
        console.error('Error exporting Excel:', err);
        this.exporting = false;
      }
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
