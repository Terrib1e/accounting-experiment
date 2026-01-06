import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxRateService } from '../../../../core/services/tax-rate.service';
import { TaxRate } from '../../../../core/models/tax-rate.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TaxRateFormComponent } from '../tax-rate-form/tax-rate-form.component';

@Component({
  selector: 'app-tax-rate-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatDialogModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Tax Rates</h2>
           <p class="text-slate-500">Manage sales tax rates and codes.</p>
        </div>
        <app-button icon="add" (onClick)="openModal()">New Tax Rate</app-button>
      </div>

      <div class="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Rate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th class="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr *ngFor="let rate of taxRates">
              <td class="px-6 py-4 text-sm font-mono text-slate-600">{{ rate.code }}</td>
              <td class="px-6 py-4 text-sm text-slate-900">{{ rate.name }}</td>
              <td class="px-6 py-4 text-sm text-right font-medium">{{ rate.rate | percent:'1.2-4' }}</td>
              <td class="px-6 py-4 text-sm">
                <span [class.bg-green-100]="rate.active" [class.text-green-800]="rate.active"
                      [class.bg-gray-100]="!rate.active" [class.text-gray-800]="!rate.active"
                      class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ rate.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="text-primary-600 hover:text-primary-900 text-sm font-medium" (click)="openModal(rate)">Edit</button>
              </td>
            </tr>
            <tr *ngIf="taxRates.length === 0">
               <td colspan="5" class="px-6 py-12 text-center text-slate-500">No tax rates found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TaxRateListComponent implements OnInit {
  taxRates: TaxRate[] = [];

  constructor(
    private taxRateService: TaxRateService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadRates();
  }

  loadRates() {
    this.taxRateService.getTaxRates().subscribe({
        next: (res) => this.taxRates = res.data.content,
        error: (err) => console.error(err)
    });
  }

  openModal(rate?: TaxRate) {
    const dialogRef = this.dialog.open(TaxRateFormComponent, {
       width: '500px',
       disableClose: true,
       data: rate || null,
       panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
       if (result) {
         if (rate) {
            this.taxRateService.updateTaxRate(rate.id, result).subscribe(() => this.loadRates());
         } else {
            this.taxRateService.createTaxRate(result).subscribe(() => this.loadRates());
         }
       }
    });
  }
}
