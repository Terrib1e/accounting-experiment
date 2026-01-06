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
    <h2 mat-dialog-title>
        {{ data ? 'Edit' : 'New' }} Account
        <button mat-icon-button mat-dialog-close>
            <mat-icon>close</mat-icon>
        </button>
    </h2>

    <mat-dialog-content>
        <form [formGroup]="form" id="account-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 py-2">
            <div class="grid grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Account Code</mat-label>
                  <input matInput formControlName="code" placeholder="e.g. 1000">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="e.g. Cash">
                </mat-form-field>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="ASSET">Asset</mat-option>
                    <mat-option value="LIABILITY">Liability</mat-option>
                    <mat-option value="EQUITY">Equity</mat-option>
                    <mat-option value="REVENUE">Revenue</mat-option>
                    <mat-option value="EXPENSE">Expense</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                  <mat-label>Subtype</mat-label>
                  <mat-select formControlName="subtype">
                    <mat-option *ngFor="let option of subtypeOptions" [value]="option.value">
                      {{ option.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Currency</mat-label>
                <input matInput formControlName="currency">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-slate-700">Active Status</span>
                    <span class="text-xs text-slate-500">Enable or disable this account</span>
                </div>
                <mat-slide-toggle formControlName="active" color="primary"></mat-slide-toggle>
            </div>
        </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" (click)="onSubmit()">Save Account</button>
    </mat-dialog-actions>
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
