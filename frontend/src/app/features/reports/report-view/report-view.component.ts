import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { FinancialReport } from '../../../core/models/report.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Financial Reports</h2>
           <p class="text-slate-500">Generate standard accounting reports.</p>
        </div>
        <div class="flex space-x-2">
            <button class="px-3 py-2 text-sm font-medium rounded-md"
                [class]="selectedReport === 'BALANCE_SHEET' ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:text-slate-700'"
                (click)="selectReport('BALANCE_SHEET')">Balance Sheet</button>
            <button class="px-3 py-2 text-sm font-medium rounded-md"
                [class]="selectedReport === 'INCOME_STATEMENT' ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:text-slate-700'"
                (click)="selectReport('INCOME_STATEMENT')">Income Statement</button>
            <button class="px-3 py-2 text-sm font-medium rounded-md"
                [class]="selectedReport === 'TRIAL_BALANCE' ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:text-slate-700'"
                (click)="selectReport('TRIAL_BALANCE')">Trial Balance</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-end space-x-4">
          <div>
              <label class="block text-sm font-medium text-slate-700">As Of / Start Date</label>
              <input type="date" [(ngModel)]="startDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2">
          </div>

          <div *ngIf="selectedReport === 'INCOME_STATEMENT'">
              <label class="block text-sm font-medium text-slate-700">End Date</label>
              <input type="date" [(ngModel)]="endDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2">
          </div>

          <app-button (onClick)="runReport()" [loading]="loading">Run Report</app-button>

          <!-- Export Buttons -->
          <div *ngIf="report" class="flex space-x-2 ml-auto">
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

      <!-- Report Output -->
      <div *ngIf="report" class="bg-white shadow-sm rounded-lg border border-slate-200 p-8 print:shadow-none print:border-none">
         <div class="text-center mb-8">
             <h3 class="text-2xl font-bold text-slate-900">{{ report.reportName }}</h3>
             <p class="text-slate-500" *ngIf="report.startDate">Period: {{ report.startDate | date }} to {{ report.endDate | date }}</p>
             <p class="text-slate-500" *ngIf="!report.startDate">As of {{ report.endDate | date }}</p>
         </div>

         <div class="space-y-8">
             <div *ngFor="let section of objectKeys(report.sections)">
                 <h4 class="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wide">{{ section }}</h4>

                 <div class="space-y-2">
                     <div *ngFor="let line of report.sections[section]" class="flex justify-between items-center text-sm">
                         <span class="text-slate-700 pl-4">{{ line.accountName }}</span>
                         <span class="font-medium text-slate-900">{{ line.balance | currency }}</span>
                     </div>
                 </div>

                 <div class="flex justify-between items-center text-sm font-bold text-slate-900 mt-4 pt-4 border-t border-slate-100">
                      <span>Total {{ section }}</span>
                      <span>{{ getSectionTotal(section) | currency }}</span>
                 </div>
             </div>
         </div>

         <!-- Summary -->
         <div class="mt-12 pt-8 border-t-2 border-slate-900">
             <div *ngFor="let item of objectKeys(report.summary)" class="flex justify-between items-center text-base font-bold text-slate-900 py-1">
                  <span>{{ item }}</span>
                  <span>{{ report.summary[item] | currency }}</span>
             </div>
         </div>
      </div>
    </div>
  `
})
export class ReportViewComponent {
  selectedReport: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'TRIAL_BALANCE' = 'BALANCE_SHEET';
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  report: FinancialReport | null = null;
  loading = false;
  exporting = false;

  constructor(private reportService: ReportService) {}

  selectReport(type: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'TRIAL_BALANCE') {
      this.selectedReport = type;
      this.report = null;
  }

  runReport() {
      this.loading = true;
      if (this.selectedReport === 'BALANCE_SHEET') {
          this.reportService.getBalanceSheet(this.startDate).subscribe((res: {data: FinancialReport}) => {
              this.report = res.data;
              this.loading = false;
          });
      } else if (this.selectedReport === 'INCOME_STATEMENT') {
          this.reportService.getIncomeStatement(this.startDate, this.endDate).subscribe((res: {data: FinancialReport}) => {
              this.report = res.data;
              this.loading = false;
          });
      } else {
          this.reportService.getTrialBalance(this.startDate).subscribe((res: {data: FinancialReport}) => {
              this.report = res.data;
              this.loading = false;
          });
      }
  }

  exportPdf() {
    this.exporting = true;
    let observable;
    let filename: string;

    if (this.selectedReport === 'BALANCE_SHEET') {
      observable = this.reportService.exportBalanceSheetPdf(this.startDate);
      filename = 'balance-sheet.pdf';
    } else if (this.selectedReport === 'INCOME_STATEMENT') {
      observable = this.reportService.exportIncomeStatementPdf(this.startDate, this.endDate);
      filename = 'income-statement.pdf';
    } else {
      observable = this.reportService.exportTrialBalancePdf(this.startDate);
      filename = 'trial-balance.pdf';
    }

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
    let observable;
    let filename: string;

    if (this.selectedReport === 'BALANCE_SHEET') {
      observable = this.reportService.exportBalanceSheetExcel(this.startDate);
      filename = 'balance-sheet.xlsx';
    } else if (this.selectedReport === 'INCOME_STATEMENT') {
      observable = this.reportService.exportIncomeStatementExcel(this.startDate, this.endDate);
      filename = 'income-statement.xlsx';
    } else {
      observable = this.reportService.exportTrialBalanceExcel(this.startDate);
      filename = 'trial-balance.xlsx';
    }

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

  objectKeys(obj: any): string[] {
      return Object.keys(obj);
  }

  getSectionTotal(sectionName: string): number {
      if (!this.report) return 0;
      return this.report.sections[sectionName].reduce((acc: number, line: any) => acc + (line.balance || 0), 0);
  }
}
