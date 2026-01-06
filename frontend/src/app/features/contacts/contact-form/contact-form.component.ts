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
import { Contact } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-form',
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
        {{ data ? 'Edit' : 'New' }} Contact
        <button mat-icon-button mat-dialog-close>
            <mat-icon>close</mat-icon>
        </button>
    </h2>

    <mat-dialog-content>
        <form [formGroup]="form" id="contact-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 py-2">
            <div class="grid grid-cols-12 gap-4">
                 <div class="col-span-8">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                      <mat-label>Name</mat-label>
                      <input matInput formControlName="name" placeholder="Contact Name">
                    </mat-form-field>
                 </div>

                 <div class="col-span-4">
                     <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Type</mat-label>
                        <mat-select formControlName="type">
                            <mat-option value="CUSTOMER">Customer</mat-option>
                            <mat-option value="VENDOR">Vendor</mat-option>
                            <mat-option value="EMPLOYEE">Employee</mat-option>
                        </mat-select>
                     </mat-form-field>
                 </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email" placeholder="email@example.com">
                    </mat-form-field>
                </div>

                <div class="col-span-6">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" placeholder="+1 (555) 000-0000">
                    </mat-form-field>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                 <div class="col-span-6">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                      <mat-label>Tax ID</mat-label>
                      <input matInput formControlName="taxId">
                    </mat-form-field>
                 </div>

                 <div class="col-span-6">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Currency</mat-label>
                        <input matInput formControlName="currency">
                    </mat-form-field>
                 </div>
            </div>

            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="3"></textarea>
            </mat-form-field>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex flex-col">
                    <span class="font-medium text-slate-900">Active Status</span>
                    <span class="text-xs text-slate-500">Enable or disable this contact</span>
                </div>
                <mat-slide-toggle formControlName="active" color="primary"></mat-slide-toggle>
            </div>
        </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" (click)="onSubmit()">Save Contact</button>
    </mat-dialog-actions>
  `
})
export class ContactFormComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ContactFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Contact | null
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['CUSTOMER', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      taxId: [''],
      currency: ['USD', Validators.required],
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
      this.dialogRef.close(this.form.value);
    }
  }
}
