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
import { InvoiceService } from '../../../core/services/invoice.service';
import { ContactService } from '../../../core/services/contact.service';
import { AccountService } from '../../../core/services/account.service';
import { Invoice, InvoiceLine } from '../../../core/models/invoice.model';
import { Contact } from '../../../core/models/contact.model';
import { Account } from '../../../core/models/account.model';
import { TaxRate } from '../../../core/models/tax-rate.model';
import { TaxRateService } from '../../../core/services/tax-rate.service';

@Component({
  selector: 'app-invoice-form',
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
    MatNativeDateModule,
  ],
  template: `
    <div class="premium-dialog flex flex-col h-full bg-white text-slate-900">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 bg-white">
            <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/30">
                    <mat-icon class="text-indigo-600 scale-90">{{ data ? 'edit_document' : 'receipt' }}</mat-icon>
                </div>
                <div class="flex flex-col">
                    <h2 class="text-slate-900 text-lg font-bold tracking-tight leading-none m-0">{{ data ? 'Edit' : 'Draft' }} Invoice</h2>
                    <span class="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Accounts Receivable
                    </span>
                </div>
            </div>
            <button mat-icon-button mat-dialog-close class="hover:bg-slate-50 transition-all rounded-xl text-slate-400">
                <mat-icon>close</mat-icon>
            </button>
        </div>

    <mat-dialog-content class="!p-0 !m-0 bg-slate-50/30">
      <form [formGroup]="form" id="invoice-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-10 p-8">

        <!-- Metadata Section -->
        <div class="space-y-5">
            <div class="flex items-center gap-2 px-1">
                <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Invoice Identity</h3>
            </div>
            <div class="grid grid-cols-12 gap-5 px-1">
                <div class="col-span-12 md:col-span-8">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Customer / Client</mat-label>
                        <select matNativeControl formControlName="contactId" required>
                            <option value="" disabled selected>Select Customer</option>
                            <option *ngFor="let contact of customers" [value]="contact.id">
                                {{ contact.name }}
                            </option>
                        </select>
                    </mat-form-field>
                </div>

                <div class="col-span-12 md:col-span-4">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Reference #</mat-label>
                        <input matInput formControlName="reference" placeholder="PO Number etc.">
                    </mat-form-field>
                </div>

                <div class="col-span-12 md:col-span-4">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Issue Date</mat-label>
                        <input matInput [matDatepicker]="issuePicker" formControlName="issueDate">
                        <mat-datepicker-toggle matIconSuffix [for]="issuePicker"></mat-datepicker-toggle>
                        <mat-datepicker #issuePicker></mat-datepicker>
                    </mat-form-field>
                </div>

                <div class="col-span-12 md:col-span-4">
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Due Date</mat-label>
                        <input matInput [matDatepicker]="duePicker" formControlName="dueDate">
                        <mat-datepicker-toggle matIconSuffix [for]="duePicker"></mat-datepicker-toggle>
                        <mat-datepicker #duePicker></mat-datepicker>
                    </mat-form-field>
                </div>

                <div class="col-span-12 md:col-span-4">
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

        <!-- Items Table Section -->
        <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
                <div class="flex items-center gap-2">
                    <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Pricing & Items</label>
                </div>
                <button mat-stroked-button type="button" (click)="addLine()" class="!rounded-xl !border-slate-200 !text-slate-600 hover:!bg-slate-50 !font-bold !text-[11px] !py-1 h-8">
                    <mat-icon class="!text-sm !w-4 !h-4 !min-w-[16px] !min-h-[16px] !m-0">add</mat-icon>
                    <span class="ml-1 uppercase">Add Item</span>
                </button>
            </div>

            <div class="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm mx-1">
                <table class="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100">
                            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/4">Revenue Account</th>
                            <th class="px-3 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-20 text-right">Qty</th>
                            <th class="px-3 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24 text-right">Price</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 text-right">Amount</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10 text-center"></th>
                        </tr>
                    </thead>
                    <tbody formArrayName="lines" class="divide-y divide-slate-50">
                        <tr *ngFor="let line of lines.controls; let i = index" [formGroupName]="i" class="group hover:bg-slate-50/40 transition-colors">
                            <td class="px-4 py-3">
                                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                    <input matInput formControlName="description" placeholder="Product or service..." />
                                </mat-form-field>
                            </td>
                            <td class="px-4 py-3">
                                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                    <select matNativeControl formControlName="revenueAccountId" required>
                                        <option value="" disabled>Select Account</option>
                                        <option *ngFor="let acc of revenueAccounts" [value]="acc.id">
                                            {{ acc.code }} - {{ acc.name }}
                                        </option>
                                    </select>
                                </mat-form-field>
                            </td>
                            <td class="px-2 py-3">
                                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                    <input matInput type="number" formControlName="quantity" class="text-right font-medium" />
                                </mat-form-field>
                            </td>
                            <td class="px-2 py-3">
                                <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                    <input matInput type="number" formControlName="unitPrice" class="text-right font-medium" />
                                </mat-form-field>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <span class="font-bold text-slate-800">
                                    {{ (line.get('quantity')?.value * line.get('unitPrice')?.value) || 0 | currency:(form.get('currency')?.value || 'USD') }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <button mat-icon-button type="button" (click)="removeLine(i)"
                                        class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all rounded-lg">
                                    <mat-icon class="!text-lg">delete_outline</mat-icon>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-slate-900 text-white">
                        <tr>
                            <td colspan="4" class="px-8 py-6">
                                <div class="flex flex-col">
                                    <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Billing Summary</span>
                                    <span class="text-xs text-slate-500 mt-1">{{lines.length}} line items included</span>
                                </div>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <div class="flex flex-col items-end">
                                    <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Total Receivable</span>
                                    <span class="text-2xl font-bold tracking-tight text-white">{{ totalAmount | currency:(form.get('currency')?.value || 'USD') }}</span>
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
        <button mat-button mat-dialog-close class="!rounded-xl !px-6 h-12 !text-slate-500 hover:bg-slate-50 font-bold transition-all">Discard</button>
        <button mat-flat-button color="primary"
                (click)="onSubmit()"
                [disabled]="form.invalid"
                class="!min-w-[200px] !bg-indigo-600 !text-white !rounded-xl !h-12 shadow-lg shadow-indigo-500/10 hover:shadow-xl transition-all font-bold">
            <div class="flex items-center justify-center gap-2">
                <mat-icon class="!text-lg">{{ data ? 'save' : 'send' }}</mat-icon>
                <span class="tracking-tight">{{ data ? 'Update' : 'Issue' }} Invoice</span>
            </div>
        </button>
    </mat-dialog-actions>
    </div>
`  ,
})
export class InvoiceFormComponent implements OnInit {
  form: FormGroup;
  customers: Contact[] = [];
  revenueAccounts: Account[] = [];
  taxRates: TaxRate[] = [];

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private contactService: ContactService,
    private accountService: AccountService,
    private taxRateService: TaxRateService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<InvoiceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Invoice | null
  ) {
    this.form = this.fb.group({
      contactId: ['', Validators.required],
      reference: [''],
      issueDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
      currency: ['USD', Validators.required],
      notes: [''],
      lines: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Load customers
    this.contactService.getContacts().subscribe({
      next: (res) => {
        console.log('InvoiceForm: Contacts loaded:', res);
        if (res && res.data && res.data.content) {
          this.customers = res.data.content.filter(c => c.type === 'CUSTOMER');
          console.log('InvoiceForm: Filtered customers:', this.customers);
          this.cdr.detectChanges();
        } else {
          console.warn('InvoiceForm: No contacts data found');
          this.customers = [];
        }
      },
      error: (err) => {
        console.error('InvoiceForm: Error loading contacts:', err);
      }
    });

    // Load revenue accounts
    this.accountService.getAccounts().subscribe((res) => {
      this.revenueAccounts = res.data.filter((a) => a.type === 'REVENUE');
      this.cdr.detectChanges();
    });

    // Load tax rates
    this.taxRateService.getTaxRates().subscribe((res) => {
      this.taxRates = res.data.content.filter((r) => r.active);
    });

    if (this.data) {
      this.form.patchValue({
        contactId: this.data.contact?.id,
        reference: this.data.reference,
        issueDate: this.data.issueDate,
        dueDate: this.data.dueDate,
        currency: this.data.currency,
        notes: this.data.notes,
      });
      if (this.data.lines) {
        this.data.lines.forEach((line) => this.addLine(line));
      }
    } else {
      this.addLine();
    }
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  addLine(line?: InvoiceLine) {
    const lineGroup = this.fb.group({
      description: [line?.description || '', Validators.required],
      revenueAccountId: [line?.revenueAccount?.id || '', Validators.required],
      taxRateId: [line?.taxRate?.id || null],
      quantity: [
        line?.quantity || 1,
        [Validators.required, Validators.min(0.01)],
      ],
      unitPrice: [
        line?.unitPrice || 0,
        [Validators.required, Validators.min(0)],
      ],
      amount: [{ value: line?.amount || 0, disabled: true }],
    });
    this.lines.push(lineGroup);
    this.updateAmount(this.lines.length - 1);
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
  }

  updateAmount(index: number) {
    const line = this.lines.at(index);
    const qty = line.get('quantity')?.value || 0;
    const price = line.get('unitPrice')?.value || 0;
    const amount = qty * price;
    line.get('amount')?.setValue(amount);
  }

  get totalAmount() {
    return (this.lines.getRawValue() as any[]).reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0
    );
  }

  onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue(); // Get disabled amount values too

      const { contactId, ...rest } = value;
      const payload = {
        ...rest,
        contact: { id: contactId },
        lines: value.lines.map((l: any) => {
           const { revenueAccountId, taxRateId, ...lineRest } = l;
           return {
            ...lineRest,
            revenueAccount: { id: revenueAccountId },
            taxRate: taxRateId ? { id: taxRateId } : null,
          };
        }),
      };

      this.dialogRef.close(payload);
    }
  }
}
