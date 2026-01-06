import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../../core/services/business.service';
import { BankAccount } from '../../../core/models/bank-account.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-bank-account-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Bank Accounts</h2>
           <p class="text-slate-500">Manage bank feeds and reconciliation.</p>
        </div>
        <app-button icon="add">Connect Bank</app-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let account of accounts" class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <div class="flex justify-between items-start">
              <div>
                 <h3 class="text-lg font-medium text-slate-900">{{ account.name }}</h3>
                 <p class="text-sm text-slate-500">{{ account.bankName }} - {{ account.accountNumber }}</p>
              </div>
              <span class="material-icons text-slate-300">account_balance</span>
           </div>

           <div class="mt-6">
              <p class="text-sm text-slate-500">Current Balance</p>
              <p class="text-3xl font-bold text-slate-900">{{ account.currentBalance | currency:account.currency }}</p>
           </div>

           <div class="mt-6 flex space-x-3">
              <button class="flex-1 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Reconcile</button>
              <button class="flex-1 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Details</button>
           </div>
        </div>

        <!-- Empty State if needed, or Add New Card -->
        <div *ngIf="accounts.length === 0" class="col-span-full bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
            <span class="material-icons text-slate-400 text-4xl mb-2">account_balance_wallet</span>
            <h3 class="text-lg font-medium text-slate-900">No bank accounts connected</h3>
            <p class="text-slate-500 mb-6">Connect a bank account to start importing transactions.</p>
            <app-button icon="add">Connect Bank</app-button>
        </div>
      </div>
    </div>
  `
})
export class BankAccountListComponent implements OnInit {
  accounts: BankAccount[] = [];

  constructor(private businessService: BusinessService) {}

  ngOnInit() {
    this.businessService.getBankAccounts().subscribe({
        next: (res: {data: { content: BankAccount[] }}) => this.accounts = res.data.content,
        error: (err: any) => console.error(err)
    });
  }
}
