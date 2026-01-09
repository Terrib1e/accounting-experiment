import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../../core/services/account.service';
import { Account, ACCOUNT_SUBTYPE_OPTIONS } from '../../../core/models/account.model';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  template: `
    <div class="premium-dialog flex flex-col h-full bg-white text-slate-900">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 bg-white">
            <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100/30">
                    <mat-icon class="text-primary-600 scale-90">{{ data ? 'account_balance_wallet' : 'account_balance' }}</mat-icon>
                </div>
                <div class="flex flex-col">
                    <h2 class="text-slate-900 text-lg font-bold tracking-tight leading-none m-0">{{ data ? 'Edit' : 'New' }} Ledger Account</h2>
                    <span class="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Chart of Accounts
                    </span>
                </div>
            </div>
            <button mat-icon-button mat-dialog-close class="hover:bg-slate-50 transition-all rounded-xl text-slate-400">
                <mat-icon>close</mat-icon>
            </button>
        </div>

    <mat-dialog-content class="!p-0 !m-0 bg-slate-50/30">
        <form [formGroup]="form" id="account-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-8 p-8">

            <!-- Code & Name Section -->
            <div class="flex flex-col gap-1">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none px-1">Primary Details</h3>
                <div class="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-12 gap-6 mt-3">
                    <div class="col-span-12 md:col-span-4">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Account Code</mat-label>
                            <input matInput formControlName="code" placeholder="e.g. 1000" required>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-8">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Account Name</mat-label>
                            <input matInput formControlName="name" placeholder="e.g. Cash in Bank" required>
                        </mat-form-field>
                    </div>
                </div>
            </div>

            <!-- Classification Section -->
            <div class="flex flex-col gap-1">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none px-1">Classification & Defaults</h3>
                <div class="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-12 gap-6 mt-3">
                    <div class="col-span-12 md:col-span-6">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Base Type</mat-label>
                            <mat-select formControlName="type" required>
                                <mat-option value="ASSET">Asset</mat-option>
                                <mat-option value="LIABILITY">Liability</mat-option>
                                <mat-option value="EQUITY">Equity</mat-option>
                                <mat-option value="REVENUE">Revenue</mat-option>
                                <mat-option value="EXPENSE">Expense</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-6">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Account Subtype</mat-label>
                            <mat-select formControlName="subtype" required>
                                <mat-option *ngFor="let option of subtypeOptions" [value]="option.value">
                                    {{ option.label }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-4">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Currency</mat-label>
                            <mat-select formControlName="currency">
                                <mat-option value="USD">USD - US Dollar</mat-option>
                                <mat-option value="EUR">EUR - Euro</mat-option>
                                <mat-option value="GBP">GBP - British Pound</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-8">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Internal Description</mat-label>
                            <input matInput formControlName="description" placeholder="Brief notes about account usage">
                        </mat-form-field>
                    </div>
                </div>
            </div>

            <div class="mx-1 mt-2 p-4 bg-slate-900 rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-4 pl-2">
                    <div class="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center">
                        <mat-icon class="text-primary-400 scale-90">account_tree</mat-icon>
                    </div>
                    <div class="flex flex-col text-white">
                        <span class="font-bold tracking-tight text-sm">Active Ledger Status</span>
                        <span class="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Enabled for journal postings</span>
                    </div>
                </div>
                <mat-slide-toggle formControlName="active" color="primary" class="!pr-2"></mat-slide-toggle>
            </div>
        </form>
    </mat-dialog-content>

    <mat-dialog-actions class="!px-8 !py-6 bg-white border-t border-slate-100">
        <button mat-button mat-dialog-close class="!rounded-xl !px-6 h-12 !text-slate-500 hover:bg-slate-50 font-bold transition-all">Cancel</button>
        <button mat-flat-button color="primary"
                (click)="onSubmit()"
                [disabled]="form.invalid"
                class="!min-w-[200px] !bg-primary-600 !text-white !rounded-xl !h-12 shadow-xl shadow-primary-500/10 hover:shadow-xl transition-all font-bold">
            <div class="flex items-center justify-center gap-2">
                <mat-icon class="!text-lg">{{ data ? 'save' : 'add_task' }}</mat-icon>
                <span class="tracking-tight">{{ data ? 'Update' : 'Create' }} Account</span>
            </div>
        </button>
    </mat-dialog-actions>
    </div>
`
})
export class AccountFormComponent implements OnInit {
  subtypeOptions = ACCOUNT_SUBTYPE_OPTIONS;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private dialogRef: MatDialogRef<AccountFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Account | null
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: ['', Validators.required],
      subtype: ['', Validators.required],
      currency: ['USD', Validators.required],
      description: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
        // Handle update vs create logic via logic in the caller or here if we want to call service directly.
        // Usually dialog returns data.
        this.dialogRef.close(this.form.value);
    }
  }
}
