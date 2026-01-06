import { Component, Inject, OnInit } from '@angular/core';
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
    <h2 mat-dialog-title>
        {{ data ? 'Edit' : 'New' }} Expense
        <button mat-icon-button mat-dialog-close>
            <mat-icon>close</mat-icon>
        </button>
    </h2>

    <mat-dialog-content>
        <form [formGroup]="form" id="expense-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6 py-2">
            <!-- Header -->
            <div class="grid grid-cols-12 gap-4">
                 <div class="col-span-6">
                     <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Vendor *</mat-label>
                        <mat-select formControlName="vendorId" placeholder="Select Vendor" required>
                            <mat-option *ngFor="let contact of vendors" [value]="contact.id">
                                {{contact.name}}
                            </mat-option>
                        </mat-select>
                        <mat-error *ngIf="form.get('vendorId')?.hasError('required')">Vendor is required</mat-error>
                     </mat-form-field>
                 </div>

                 <div class="col-span-6">
                     <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Reference #</mat-label>
                        <input matInput formControlName="referenceNumber" placeholder="Bill Number">
                     </mat-form-field>
                 </div>

                 <div class="col-span-6">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                    <mat-label>Date</mat-label>
                    <input matInput [matDatepicker]="datePicker" formControlName="date">
                    <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
                    <mat-datepicker #datePicker></mat-datepicker>
                    </mat-form-field>
                 </div>

                 <div class="col-span-6">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Currency</mat-label>
                        <input matInput formControlName="currency">
                    </mat-form-field>
                 </div>
            </div>

            <!-- Lines Table -->
            <div class="border border-slate-200 rounded-lg overflow-hidden">
                <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 class="font-semibold text-slate-700 m-0">Expense Details</h3>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-white border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th class="px-4 py-2">Description</th>
                                <th class="px-4 py-2 w-1/3">Expense Account</th>
                                <th class="px-4 py-2 w-32 text-right">Amount</th>
                                <th class="px-4 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody formArrayName="lines" class="divide-y divide-slate-100">
                            <tr *ngFor="let line of lines.controls; let i=index" [formGroupName]="i" class="valign-top group hover:bg-slate-50 transition-colors">
                                <td class="px-4 py-2">
                                    <mat-form-field appearance="outline" class="w-full dense-field" subscriptSizing="dynamic">
                                        <input matInput formControlName="description" placeholder="Description">
                                    </mat-form-field>
                                </td>
                                <td class="px-4 py-2">
                                    <mat-form-field appearance="outline" class="w-full dense-field" subscriptSizing="dynamic">
                                        <mat-select formControlName="expenseAccountId" placeholder="Select Account">
                                             <mat-option *ngFor="let acc of expenseAccounts" [value]="acc.id">
                                                <span class="font-mono text-xs text-slate-500 mr-2">{{acc.code}}</span>
                                                {{acc.name}}
                                            </mat-option>
                                        </mat-select>
                                    </mat-form-field>
                                </td>
                                <td class="px-4 py-2">
                                    <mat-form-field appearance="outline" class="w-full dense-field text-right-input" subscriptSizing="dynamic">
                                        <input matInput type="number" formControlName="amount" class="text-right">
                                    </mat-form-field>
                                </td>
                                <td class="px-4 py-2 text-center align-middle">
                                    <button mat-icon-button color="warn" type="button" (click)="removeLine(i)" class="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <mat-icon>delete_outline</mat-icon>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200">
                            <tr>
                                <td colspan="2" class="px-4 py-3">
                                    <button mat-button color="primary" type="button" (click)="addLine()">
                                        <mat-icon>add</mat-icon> Add Line
                                    </button>
                                </td>
                                <td class="px-4 py-3 text-right text-lg">
                                    {{ totalAmount | currency }}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" (click)="onSubmit()">Save Expense</button>
    </mat-dialog-actions>

    <style>
        .dense-field .mat-mdc-form-field-wrapper { padding-bottom: 0; }
        .dense-field .mat-mdc-form-field-infix { padding-top: 6px; padding-bottom: 6px; min-height: 36px; }
        .text-right-input input { text-align: right; }
    </style>
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
    this.contactService.getContacts().subscribe(res => {
        if (res && res.data && res.data.content) {
            this.vendors = res.data.content; // Should filter for VENDOR
        } else {
            this.vendors = [];
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
