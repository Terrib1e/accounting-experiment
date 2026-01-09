import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ExpenseService } from '../../../core/services/expense.service';
import { ContactService } from '../../../core/services/contact.service';
import { AccountService } from '../../../core/services/account.service';
import { Expense, ExpenseLine } from '../../../core/models/expense.model';
import { Contact } from '../../../core/models/contact.model';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="premium-dialog flex flex-col h-full bg-white">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 bg-white">
            <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100/30">
                    <mat-icon class="text-primary-600 scale-90">{{ data ? 'edit' : 'receipt_long' }}</mat-icon>
                </div>
                <div class="flex flex-col">
                    <h2 class="text-slate-900 text-lg font-bold tracking-tight leading-none m-0">{{ data ? 'Edit' : 'Create' }} Expense</h2>
                    <span class="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Financial Core
                    </span>
                </div>
            </div>
            <button mat-icon-button mat-dialog-close class="hover:bg-slate-50 transition-all rounded-xl text-slate-400">
                <mat-icon>close</mat-icon>
            </button>
        </div>

        <mat-dialog-content class="!p-0 !m-0 bg-slate-50/30">
            <form [formGroup]="form" id="expense-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-10 p-8">

                <!-- Section: Transaction Context -->
                <div class="space-y-5">
                    <div class="flex items-center gap-2 px-1">
                        <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                        <div class="flex flex-col">
                            <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Primary Details</h3>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-5 px-1">
                        <div class="col-span-12 md:col-span-8">
                            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                <mat-label>Vendor / Payee</mat-label>
                                <select matNativeControl formControlName="vendorId" required>
                                    <option value="" disabled selected>Select Vendor</option>
                                    <option *ngFor="let contact of vendors" [value]="contact.id">
                                        {{ contact.name }}
                                    </option>
                                </select>
                            </mat-form-field>
                            <!-- DEBUG -->
                            <p class="text-xs text-red-500 mt-1">DEBUG: {{ vendors.length }} vendors loaded</p>
                        </div>

                        <div class="col-span-12 md:col-span-4">
                            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                <mat-label>Reference #</mat-label>
                                <input matInput formControlName="referenceNumber" placeholder="Receipt info">
                            </mat-form-field>
                        </div>

                        <div class="col-span-12 md:col-span-6">
                            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                <mat-label>Transaction Date</mat-label>
                                <input matInput [matDatepicker]="datePicker" formControlName="date">
                                <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
                                <mat-datepicker #datePicker></mat-datepicker>
                            </mat-form-field>
                        </div>

                        <div class="col-span-12 md:col-span-6">
                            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                <mat-label>Currency</mat-label>
                                <select matNativeControl formControlName="currency">
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                </select>
                            </mat-form-field>
                        </div>
                    </div>
                </div>

                <!-- Section: Accounting Allocation -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between px-1">
                        <div class="flex items-center gap-2">
                            <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                            <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Accounting Allocation</h3>
                        </div>
                        <button mat-stroked-button type="button" (click)="addLine()" class="!rounded-xl !border-slate-200 !text-slate-600 hover:!bg-slate-50 !font-bold !text-[11px] !py-1 h-8">
                            <mat-icon class="!text-sm !w-4 !h-4 !min-w-[16px] !min-h-[16px] !m-0">add</mat-icon>
                            <span class="ml-1">ADD LINE</span>
                        </button>
                    </div>

                    <div class="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm mx-1">
                        <table class="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-slate-100">
                                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/3">Ledger Account</th>
                                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36 text-right">Amount</th>
                                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-14"></th>
                                </tr>
                            </thead>
                            <tbody formArrayName="lines" class="divide-y divide-slate-50">
                                <tr *ngFor="let line of lines.controls; let i=index" [formGroupName]="i" class="group hover:bg-slate-50/40 transition-colors">
                                    <td class="px-4 py-3">
                                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                            <input matInput formControlName="description" placeholder="Item detail">
                                        </mat-form-field>
                                    </td>
                                    <td class="px-4 py-3">
                                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                            <select matNativeControl formControlName="expenseAccountId" required>
                                                <option value="" disabled>Select Account</option>
                                                <option *ngFor="let acc of expenseAccounts" [value]="acc.id">
                                                    {{ acc.code }} - {{ acc.name }}
                                                </option>
                                            </select>
                                        </mat-form-field>
                                    </td>
                                    <td class="px-4 py-3">
                                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                            <span matPrefix class="text-slate-400 text-xs pl-2">$</span>
                                            <input matInput type="number" formControlName="amount" class="text-right font-bold text-slate-800">
                                        </mat-form-field>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <button mat-icon-button type="button" (click)="removeLine(i)"
                                                class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all rounded-lg">
                                            <mat-icon class="!text-lg">delete_outline</mat-icon>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot class="bg-primary-950 text-white">
                                <tr>
                                    <td colspan="2" class="px-8 py-6">
                                        <div class="flex flex-col">
                                            <span class="text-[10px] text-primary-400 uppercase tracking-widest font-bold">Consolidated Allocation</span>
                                            <span class="text-xs text-primary-300 mt-1">{{lines.length}} entry lines configured</span>
                                        </div>
                                    </td>
                                    <td class="px-8 py-6 text-right">
                                        <div class="flex flex-col items-end">
                                            <span class="text-[10px] text-primary-400 uppercase tracking-widest font-bold font-mono">Total Transaction</span>
                                            <span class="text-2xl font-bold tracking-tight text-white">{{ totalAmount | currency:form.get('currency')?.value }}</span>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </form>
        </mat-dialog-content>

        <mat-dialog-actions class="!px-8 !py-6 bg-white border-t border-slate-100">
            <button mat-button mat-dialog-close class="!rounded-xl !px-6 h-12 !text-slate-500 hover:bg-slate-50 font-bold transition-all">Cancel</button>
            <button mat-flat-button color="primary"
                    (click)="onSubmit()"
                    [disabled]="form.invalid"
                    class="!min-w-[200px] !bg-primary-600 !text-white !rounded-xl !h-12 shadow-lg shadow-primary-500/10 hover:shadow-xl transition-all font-bold">
                <div class="flex items-center justify-center gap-2">
                    <mat-icon class="!text-lg">{{ data ? 'save' : 'add_circle' }}</mat-icon>
                    <span class="tracking-tight">{{ data ? 'Update' : 'Post' }} Expense</span>
                </div>
            </button>
        </mat-dialog-actions>
    </div>
`
})
export class ExpenseFormComponent implements OnInit {
  form: FormGroup;
  vendors: Contact[] = [];
  expenseAccounts: Account[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private contactService: ContactService,
    private accountService: AccountService,
    private dialogRef: MatDialogRef<ExpenseFormComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: Expense | null
  ) {
    this.form = this.fb.group({
      vendorId: ['', Validators.required],
      referenceNumber: [''],
      date: [new Date(), Validators.required],
      currency: ['USD', Validators.required],
      lines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.contactService.getContacts().subscribe({
        next: (res) => {
            console.log('ExpenseForm: Contacts loaded:', res);
            if (res && res.data && res.data.content) {
                this.vendors = res.data.content.filter(c => c.type === 'VENDOR');
                console.log('ExpenseForm: Filtered vendors:', this.vendors);
                this.cdr.detectChanges();
            } else {
                console.warn('ExpenseForm: No contacts data found');
                this.vendors = [];
            }
        },
        error: (err) => {
             console.error('ExpenseForm: Error loading contacts:', err);
        }
    });

    this.accountService.getAccounts().subscribe(res => {
        console.log('Fetching accounts response:', res);
        if (res && res.data) {
            console.log('All accounts:', res.data);
            this.expenseAccounts = res.data.filter(a =>
                (a.type && a.type.toUpperCase() === 'EXPENSE') ||
                (a.subtype && a.subtype.toUpperCase() === 'COST_OF_GOODS_SOLD')
            );
            console.log('Filtered expense accounts:', this.expenseAccounts);
            this.cdr.detectChanges();
        } else {
            console.warn('No accounts data found in response:', res);
            this.expenseAccounts = [];
        }
    });

    if (this.data) {
      this.form.patchValue({
          vendorId: this.data.vendor?.id,
          referenceNumber: this.data.referenceNumber,
          date: this.data.date,
          currency: this.data.currency
      });
      if (this.data.lines) {
          this.data.lines.forEach(line => this.addLine(line));
      }
    } else {
        this.addLine();
    }
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  addLine(line?: ExpenseLine) {
    const lineGroup = this.fb.group({
      description: [line?.description || '', Validators.required],
      expenseAccountId: [line?.expenseAccount?.id || '', Validators.required],
      amount: [line?.amount || 0, [Validators.required, Validators.min(0)]]
    });
    this.lines.push(lineGroup);
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
  }

  get totalAmount() {
      return (this.lines.value as any[]).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }

  onSubmit(): void {
    if (this.form.valid) {
        const value = this.form.value;
        const payload = {
            ...value,
            vendor: { id: value.vendorId },
            lines: value.lines.map((l: any) => ({
                ...l,
                expenseAccount: { id: l.expenseAccountId }
            }))
        };
        this.dialogRef.close(payload);
    }
  }
}
