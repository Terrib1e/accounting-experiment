import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TaxRate } from '../../../../core/models/tax-rate.model';

@Component({
  selector: 'app-tax-rate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
        {{ data ? 'Edit' : 'New' }} Tax Rate
        <button mat-icon-button mat-dialog-close>
            <mat-icon>close</mat-icon>
        </button>
    </h2>

    <mat-dialog-content>
        <form [formGroup]="form" id="tax-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 py-2">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. NY Sales Tax">
            </mat-form-field>

            <div class="grid grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                    <mat-label>Code</mat-label>
                    <input matInput formControlName="code" placeholder="e.g. NY-8.875">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                    <mat-label>Rate (Decimal)</mat-label>
                    <input matInput type="number" step="0.0001" formControlName="rate" placeholder="0.08875">
                    <mat-hint>Enter 0.08875 for 8.875%</mat-hint>
                </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-slate-700">Active Status</span>
                    <span class="text-xs text-slate-500">Enable or disable this tax rate</span>
                </div>
                <mat-slide-toggle formControlName="active" color="primary"></mat-slide-toggle>
            </div>
        </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" (click)="onSubmit()">Save Rate</button>
    </mat-dialog-actions>
  `
})
export class TaxRateFormComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaxRateFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaxRate | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      code: [data?.code || '', Validators.required],
      rate: [data?.rate || 0, [Validators.required, Validators.min(0)]],
      description: [data?.description || ''],
      active: [data?.active ?? true]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
