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
    <div class="premium-dialog flex flex-col h-full bg-white text-slate-900">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 bg-white">
            <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100/30">
                    <mat-icon class="text-primary-600 scale-90">{{ data ? 'person_edit' : 'person_add' }}</mat-icon>
                </div>
                <div class="flex flex-col">
                    <h2 class="text-slate-900 text-lg font-bold tracking-tight leading-none m-0">{{ data ? 'Edit' : 'New' }} Contact</h2>
                    <span class="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Entity Directory
                    </span>
                </div>
            </div>
            <button mat-icon-button mat-dialog-close class="hover:bg-slate-50 transition-all rounded-xl text-slate-400">
                <mat-icon>close</mat-icon>
            </button>
        </div>

    <mat-dialog-content class="!p-0 !m-0 bg-slate-50/30">
        <form [formGroup]="form" id="contact-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-8 p-8">

            <!-- Core Info -->
            <div class="flex flex-col gap-1">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none px-1">Primary Information</h3>
                <div class="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-12 gap-6 mt-3">
                    <div class="col-span-12 md:col-span-8">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Display Name</mat-label>
                            <input matInput formControlName="name" placeholder="Full legal name" required>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-4">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Contact Type</mat-label>
                            <mat-select formControlName="type">
                                <mat-option value="CUSTOMER">Customer</mat-option>
                                <mat-option value="VENDOR">Vendor</mat-option>
                                <mat-option value="EMPLOYEE">Employee</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-6">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Email Address</mat-label>
                            <input matInput formControlName="email" type="email" placeholder="billing@company.com">
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-6">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Phone Number</mat-label>
                            <input matInput formControlName="phone" placeholder="+1 (555) 000-0000">
                        </mat-form-field>
                    </div>
                </div>
            </div>

            <!-- Additional Detail -->
            <div class="flex flex-col gap-1">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none px-1">Accounting & Global Settings</h3>
                <div class="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-12 gap-6 mt-3">
                    <div class="col-span-12 md:col-span-6">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Tax Identity (TIN / SSN)</mat-label>
                            <input matInput formControlName="taxId">
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-6">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Default Currency</mat-label>
                            <mat-select formControlName="currency">
                                <mat-option value="USD">USD - US Dollar</mat-option>
                                <mat-option value="EUR">EUR - Euro</mat-option>
                                <mat-option value="GBP">GBP - British Pound</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Physical Address</mat-label>
                            <textarea matInput formControlName="address" rows="3" placeholder="Complete mailing address..."></textarea>
                        </mat-form-field>
                    </div>
                </div>
            </div>

            <div class="mx-1 mt-2 p-4 bg-slate-900 rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-4 pl-2">
                    <div class="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center">
                        <mat-icon class="text-primary-400 scale-90">toggle_on</mat-icon>
                    </div>
                    <div class="flex flex-col text-white">
                        <span class="font-bold tracking-tight text-sm">Active Profile Status</span>
                        <span class="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Visible in transaction modules</span>
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
                class="!min-w-[200px] !bg-primary-600 !text-white !rounded-xl !h-12 shadow-xl shadow-primary-500/10 hover:shadow-xl transition-all font-bold font-sans">
            <div class="flex items-center justify-center gap-2">
                <mat-icon class="!text-lg">{{ data ? 'save' : 'person_add' }}</mat-icon>
                <span class="tracking-tight">{{ data ? 'Update' : 'Register' }} Contact</span>
            </div>
        </button>
    </mat-dialog-actions>
    </div>
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
