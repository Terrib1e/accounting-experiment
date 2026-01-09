import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIcon
],
  template: `
    <div class="premium-dialog flex flex-col h-full bg-white text-slate-900">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 bg-white">
            <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100/30">
                    <mat-icon class="text-emerald-600 scale-90">account_balance_wallet</mat-icon>
                </div>
                <div class="flex flex-col">
                    <h2 class="text-slate-900 text-lg font-bold tracking-tight leading-none m-0">Register Payment</h2>
                    <span class="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Financial Settlement
                    </span>
                </div>
            </div>
            <button mat-icon-button mat-dialog-close class="hover:bg-slate-50 transition-all rounded-xl text-slate-400">
                <mat-icon>close</mat-icon>
            </button>
        </div>

    <mat-dialog-content class="!p-0 !m-0 bg-slate-50/30">
      <form [formGroup]="form" id="payment-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6 p-8 min-w-[400px]">

        <div class="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col gap-6 mt-1">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
              <mat-label>Funding Source Account</mat-label>
              <mat-select formControlName="bankAccountId" placeholder="Select bank or cash account" required>
                <mat-option *ngFor="let acc of bankAccounts" [value]="acc.id">
                  <div class="flex items-center justify-between w-full">
                    <span class="font-bold text-slate-700 text-sm">{{ acc.name }}</span>
                    <span class="px-2 py-0.5 bg-slate-100 text-[9px] font-mono rounded-md text-slate-500 uppercase tracking-wider">{{ acc.currency }}</span>
                  </div>
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
              <mat-label>Posting Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="paymentDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
        </div>

        <div class="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 flex items-start gap-4 mx-1">
            <div class="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                <mat-icon class="!text-lg !w-5 !h-5 flex items-center justify-center">verified_user</mat-icon>
            </div>
            <div class="flex flex-col">
                <span class="text-[10px] font-bold text-indigo-900 uppercase tracking-widest leading-none mt-1">Settlement Confirmation</span>
                <p class="text-[11px] text-indigo-700 mt-2 leading-relaxed opacity-80">This payment will be immediately registered in the general ledger and irreversibly linked to the source transaction document.</p>
            </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="!px-8 !py-6 bg-white border-t border-slate-100">
        <button mat-button mat-dialog-close class="!rounded-xl !px-6 h-12 !text-slate-500 hover:bg-slate-50 font-bold transition-all">Cancel</button>
        <button mat-flat-button color="primary"
                (click)="onSubmit()"
                [disabled]="form.invalid"
                class="!min-w-[200px] !bg-emerald-600 !text-white !rounded-xl !h-12 shadow-xl shadow-emerald-500/10 hover:shadow-xl transition-all font-bold">
            <div class="flex items-center justify-center gap-2">
                <mat-icon class="!text-lg text-white">check_circle</mat-icon>
                <span class="tracking-tight">Confirm Settlement</span>
            </div>
        </button>
    </mat-dialog-actions>
    </div>
  `
})
export class PaymentDialogComponent {
  form: FormGroup;
  bankAccounts: Account[] = [];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private dialogRef: MatDialogRef<PaymentDialogComponent>
  ) {
    this.form = this.fb.group({
      bankAccountId: ['', Validators.required],
      paymentDate: [new Date(), Validators.required]
    });

    this.accountService.getAccounts().subscribe(res => {
        // Filter for BANK or CASH accounts
        this.bankAccounts = res.data.filter(a => a.subtype === 'BANK' || a.subtype === 'CASH');
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
