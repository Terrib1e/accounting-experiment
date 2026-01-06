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
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Register Payment</h2>
    <mat-dialog-content>
      <form [formGroup]="form" id="payment-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 min-w-[400px]">
        <mat-form-field appearance="outline">
          <mat-label>Bank Account</mat-label>
          <mat-select formControlName="bankAccountId">
            <mat-option *ngFor="let acc of bankAccounts" [value]="acc.id">
              {{ acc.name }} ({{ acc.currency }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Payment Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="paymentDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button mat-raised-button color="primary" type="submit" form="payment-form" [disabled]="form.invalid">Confirm Payment</button>
    </mat-dialog-actions>
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
