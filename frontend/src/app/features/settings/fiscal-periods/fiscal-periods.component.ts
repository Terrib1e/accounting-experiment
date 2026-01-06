import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { FiscalPeriod } from '../../../core/models/settings.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-fiscal-periods',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Fiscal Periods</h2>
           <p class="text-slate-500">Manage accounting periods and closing.</p>
        </div>
        <app-button icon="add" (onClick)="showCreateForm = !showCreateForm">New Period</app-button>
      </div>

      <!-- Create Form -->
      <div *ngIf="showCreateForm" class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
          <h3 class="text-lg font-medium text-slate-900 mb-4">Create New Period</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Period Name (e.g. Jan 2024)" [(ngModel)]="newPeriod.name" class="rounded-md border-slate-300 p-2 border">
              <input type="date" [(ngModel)]="newPeriod.startDate" class="rounded-md border-slate-300 p-2 border">
              <input type="date" [(ngModel)]="newPeriod.endDate" class="rounded-md border-slate-300 p-2 border">
          </div>
          <div class="mt-4 flex justify-end space-x-2">
              <button class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900" (click)="showCreateForm = false">Cancel</button>
              <app-button (onClick)="createPeriod()">Create Period</app-button>
          </div>
      </div>

      <div class="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Period Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">End Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr *ngFor="let period of periods">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ period.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ period.startDate | date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ period.endDate | date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                 <span [class]="period.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                       class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                   {{ period.status }}
                 </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button *ngIf="period.status === 'OPEN'"
                        (click)="closePeriod(period)"
                        class="text-red-600 hover:text-red-900">Close Period</button>
                <span *ngIf="period.status === 'CLOSED'" class="text-slate-400">Closed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class FiscalPeriodComponent implements OnInit {
  periods: FiscalPeriod[] = [];
  showCreateForm = false;
  newPeriod: any = { name: '', startDate: '', endDate: '' };

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.loadPeriods();
  }

  loadPeriods() {
      this.settingsService.getFiscalPeriods().subscribe({
          next: (res: {data: FiscalPeriod[]}) => this.periods = res.data,
          error: (err: any) => console.error(err)
      });
  }

  createPeriod() {
      this.settingsService.createFiscalPeriod({...this.newPeriod, status: 'OPEN'}).subscribe({
          next: () => {
              this.loadPeriods();
              this.showCreateForm = false;
              this.newPeriod = { name: '', startDate: '', endDate: '' };
          },
          error: (err: any) => alert('Error creating period: ' + err.error?.message || 'Unknown error')
      });
  }

  closePeriod(period: FiscalPeriod) {
      if(confirm(`Are you sure you want to close ${period.name}? This will prevent further posting to this period.`)) {
          this.settingsService.closeFiscalPeriod(period.id).subscribe({
              next: () => this.loadPeriods(),
              error: (err: any) => alert('Error closing period')
          });
      }
  }
}
