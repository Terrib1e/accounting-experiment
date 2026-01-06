import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense } from '../../../core/models/expense.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { PaymentDialogComponent } from '../../../shared/components/payment-dialog/payment-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatDialogModule, MatMenuModule, MatIconModule],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Expenses</h2>
           <p class="text-slate-500 mt-1">Track company expenses and bills.</p>
        </div>
        <app-button icon="add" (onClick)="openCreateModal()">New Expense</app-button>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="bg-slate-50/80">
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Vendor</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Reference</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th scope="col" class="relative px-6 py-4">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            <tr *ngFor="let expense of expenses"
                class="hover:bg-primary-50/30 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ expense.date | date: 'MMM d, yyyy' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold mr-3">
                    {{ expense.vendor.name.charAt(0) || 'V' }}
                  </div>
                  <span class="text-sm font-medium text-slate-900">{{ expense.vendor.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ expense.referenceNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900">
                {{ expense.totalAmount | currency:expense.currency }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                 <span [ngClass]="{
                    'bg-accent-100 text-accent-700': expense.status === 'PAID',
                    'bg-primary-100 text-primary-700': expense.status === 'APPROVED',
                    'bg-slate-100 text-slate-600': expense.status === 'DRAFT',
                    'bg-red-100 text-red-700': expense.status === 'VOID'
                 }" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold">
                   <span class="material-icons text-xs mr-1" *ngIf="expense.status === 'PAID'">check_circle</span>
                   <span class="material-icons text-xs mr-1" *ngIf="expense.status === 'APPROVED'">verified</span>
                   <span class="material-icons text-xs mr-1" *ngIf="expense.status === 'DRAFT'">edit_note</span>
                   <span class="material-icons text-xs mr-1" *ngIf="expense.status === 'VOID'">cancel</span>
                   {{ expense.status }}
                 </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button *ngIf="expense.status === 'DRAFT'"
                        (click)="approve(expense)"
                        class="px-3 py-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all font-semibold">
                  Approve
                </button>
                <button *ngIf="expense.status === 'APPROVED'"
                        (click)="pay(expense)"
                        class="px-3 py-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all font-semibold">
                  Pay
                </button>
                <button (click)="openCreateModal(expense)"
                        [disabled]="expense.status !== 'DRAFT'"
                        class="px-3 py-1 text-slate-600 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-semibold">
                  {{ expense.status === 'DRAFT' ? 'Edit' : 'Details' }}
                </button>
                <button *ngIf="expense.status === 'DRAFT'"
                        (click)="deleteExpense(expense)"
                        class="px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all font-semibold">
                  Delete
                </button>
              </td>
            </tr>
            <tr *ngIf="expenses.length === 0">
               <td colspan="6" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center">
                    <div class="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <span class="material-icons text-3xl text-slate-400">receipt_long</span>
                    </div>
                    <p class="text-slate-500 font-medium">No expenses found</p>
                    <p class="text-slate-400 text-sm mt-1">Record your first expense to get started</p>
                  </div>
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];

  constructor(
    private expenseService: ExpenseService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getExpenses().subscribe({
        next: (res: {data: { content: Expense[] }}) => this.expenses = res.data.content,
        error: (err: any) => console.error(err)
    });
  }

  openCreateModal(expense?: Expense) {
    const dialogRef = this.dialog.open(ExpenseFormComponent, {
       width: '900px',
       disableClose: true,
       data: expense || null,
       panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
       if (result) {
         if (expense && expense.id) {
            this.expenseService.updateExpense(expense.id, result).subscribe(() => this.loadExpenses());
         } else {
            this.expenseService.createExpense(result).subscribe(() => this.loadExpenses());
         }
       }
    });
  }
  approve(expense: Expense) {
      if (confirm('Are you sure you want to approve this expense? This will post to the General Ledger.')) {
          this.expenseService.approveExpense(expense.id).subscribe(() => this.loadExpenses());
      }
  }

  pay(expense: Expense) {
      const dialogRef = this.dialog.open(PaymentDialogComponent, {
          width: '400px'
      });

      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              this.expenseService.payExpense(expense.id, result).subscribe(() => this.loadExpenses());
          }
      });
  }

  deleteExpense(expense: Expense) {
    if (confirm('Are you sure you want to delete this draft expense? This action cannot be undone.')) {
      this.expenseService.deleteExpense(expense.id).subscribe({
        next: () => this.loadExpenses(),
        error: (err) => console.error('Error deleting expense:', err)
      });
    }
  }
}
