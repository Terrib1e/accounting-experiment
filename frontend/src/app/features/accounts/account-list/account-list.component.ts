import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AccountFormComponent } from '../account-form/account-form.component';
import { AccountHierarchyComponent } from '../account-hierarchy/account-hierarchy.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    MatDialogModule,
    MatButtonToggleModule,
    AccountHierarchyComponent
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Chart of Accounts</h2>
           <p class="text-slate-500">Manage your ledger accounts.</p>
        </div>
        <div class="flex gap-3">
            <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="View Mode">
              <mat-button-toggle value="list">List</mat-button-toggle>
              <mat-button-toggle value="tree">Hierarchy</mat-button-toggle>
            </mat-button-toggle-group>
            <app-button icon="add" (onClick)="openCreateModal()">New Account</app-button>
        </div>
      </div>

      <ng-container *ngIf="viewMode === 'list'">
        <div class="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
                <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subtype</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Edit</span>
                </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
                <tr *ngFor="let account of accounts">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ account.code }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ account.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {{ account.type }}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ account.subtype }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span [class]="account.active ? 'text-green-600' : 'text-red-500'">
                    {{ account.active ? 'Active' : 'Inactive' }}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary-600 hover:text-primary-900" (click)="openCreateModal(account)">Edit</button>
                </td>
                </tr>
                <tr *ngIf="accounts.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                    No accounts found. Create one to get started.
                </td>
                </tr>
            </tbody>
            </table>
        </div>
      </ng-container>

      <ng-container *ngIf="viewMode === 'tree'">
        <div class="bg-white shadow-sm rounded-lg border border-slate-200">
            <app-account-hierarchy></app-account-hierarchy>
        </div>
      </ng-container>
    </div>
  `
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  viewMode: 'list' | 'tree' = 'list';

  constructor(
    private accountService: AccountService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getAccounts().subscribe((res) => {
        this.accounts = res.data;
    });
  }

  openCreateModal(account?: Account) {
    const dialogRef = this.dialog.open(AccountFormComponent, {
      width: '600px',
      data: account || null,
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Since API handling for create/update might differ or need ID
        // The form returns the value, but we need to know if it's update
        if (account && account.id) {
             this.accountService.updateAccount(account.id, result).subscribe(() => {
                this.loadAccounts();
             });
        } else {
            this.accountService.createAccount(result).subscribe(() => {
                this.loadAccounts();
            });
        }
      }
    });
  }
}
