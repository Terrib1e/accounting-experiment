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
    <h2 mat-dialog-title>
        {{ data ? 'Edit' : 'New' }} Invoice
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
    </h2>

    <mat-dialog-content>
      <form
        [formGroup]="form"
        id="invoice-form"
        (ngSubmit)="onSubmit()"
        class="flex flex-col gap-6 py-2"
      >
        <!-- Header section -->
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <mat-form-field
              appearance="outline"
              class="w-full"
              subscriptSizing="dynamic"
            >
              <mat-label>Customer</mat-label>
              <mat-select
                formControlName="contactId"
                placeholder="Select Customer"
              >
                <mat-option
                  *ngFor="let contact of customers"
                  [value]="contact.id"
                >
                  {{ contact.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="col-span-6">
            <mat-form-field
              appearance="outline"
              class="w-full"
              subscriptSizing="dynamic"
            >
              <mat-label>Reference</mat-label>
              <input
                matInput
                formControlName="reference"
                placeholder="PO Number etc."
              />
            </mat-form-field>
          </div>

          <div class="col-span-4">
            <mat-form-field
              appearance="outline"
              class="w-full"
              subscriptSizing="dynamic"
            >
              <mat-label>Issue Date</mat-label>
              <input
                matInput
                [matDatepicker]="issuePicker"
                formControlName="issueDate"
              />
              <mat-datepicker-toggle
                matIconSuffix
                [for]="issuePicker"
              ></mat-datepicker-toggle>
              <mat-datepicker #issuePicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="col-span-4">
            <mat-form-field
              appearance="outline"
              class="w-full"
              subscriptSizing="dynamic"
            >
              <mat-label>Due Date</mat-label>
              <input
                matInput
                [matDatepicker]="duePicker"
                formControlName="dueDate"
              />
              <mat-datepicker-toggle
                matIconSuffix
                [for]="duePicker"
              ></mat-datepicker-toggle>
              <mat-datepicker #duePicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="col-span-4">
            <mat-form-field
              appearance="outline"
              class="w-full"
              subscriptSizing="dynamic"
            >
              <mat-label>Currency</mat-label>
              <input matInput formControlName="currency" />
            </mat-form-field>
          </div>
        </div>

        <!-- Lines Table -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <div
            class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between"
          >
            <h3 class="font-semibold text-slate-700 m-0">Line Items</h3>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead
                class="bg-white border-b border-slate-200 text-slate-500 font-medium"
              >
                <tr>
                  <th class="px-4 py-2">Description</th>
                  <th class="px-4 py-2 w-1/4">Revenue Account</th>
                  <th class="px-4 py-2 w-32">Tax Rate</th>
                  <th class="px-4 py-2 w-24 text-right">Qty</th>
                  <th class="px-4 py-2 w-32 text-right">Price</th>
                  <th class="px-4 py-2 w-32 text-right">Amount</th>
                  <th class="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody formArrayName="lines" class="divide-y divide-slate-100">
                <tr
                  *ngFor="let line of lines.controls; let i = index"
                  [formGroupName]="i"
                  class="valign-top group hover:bg-slate-50 transition-colors"
                >
                  <td class="px-4 py-2">
                    <mat-form-field
                      appearance="outline"
                      class="w-full dense-field"
                      subscriptSizing="dynamic"
                    >
                      <input
                        matInput
                        formControlName="description"
                        placeholder="Item description"
                      />
                    </mat-form-field>
                  </td>
                  <td class="px-4 py-2">
                    <mat-form-field
                      appearance="outline"
                      class="w-full dense-field"
                      subscriptSizing="dynamic"
                    >
                      <mat-select
                        formControlName="revenueAccountId"
                        placeholder="Select Account"
                      >
                        <mat-option
                          *ngFor="let acc of revenueAccounts"
                          [value]="acc.id"
                        >
                          <span class="font-mono text-xs text-slate-500 mr-2">{{
                            acc.code
                          }}</span>
                          {{ acc.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </td>
                  <td class="px-4 py-2">
                    <mat-form-field
                      appearance="outline"
                      class="w-full dense-field text-right-input"
                      subscriptSizing="dynamic"
                    >
                      <input
                        matInput
                        type="number"
                        formControlName="quantity"
                        (input)="updateAmount(i)"
                        class="text-right"
                      />
                    </mat-form-field>
                  </td>
                  <td class="px-4 py-2">
                    <mat-form-field
                      appearance="outline"
                      class="w-full dense-field text-right-input"
                      subscriptSizing="dynamic"
                    >
                      <input
                        matInput
                        type="number"
                        formControlName="unitPrice"
                        (input)="updateAmount(i)"
                        class="text-right"
                      />
                    </mat-form-field>
                  </td>
                  <td
                    class="px-4 py-2 text-right font-medium text-slate-900 align-middle"
                  >
                    {{ line.get('amount')?.value | currency }}
                  </td>
                  <td class="px-4 py-2 text-center align-middle">
                    <button
                      mat-icon-button
                      color="warn"
                      type="button"
                      (click)="removeLine(i)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot
                class="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200"
              >
                <tr>
                  <td colspan="2" class="px-4 py-3">
                    <button
                      mat-button
                      color="primary"
                      type="button"
                      (click)="addLine()"
                    >
                      <mat-icon>add</mat-icon> Add Line
                    </button>
                  </td>
                  <td colspan="2" class="px-4 py-3 text-right text-slate-500">
                    Total:
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

        <mat-form-field
          appearance="outline"
          class="w-full"
          subscriptSizing="dynamic"
        >
          <mat-label>Notes</mat-label>
          <textarea
            matInput
            formControlName="notes"
            rows="2"
            placeholder="Add any relevant notes or terms..."
          ></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close type="button">Cancel</button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid"
            (click)="onSubmit()"
          >
            Save Invoice
          </button>
    </mat-dialog-actions>

    <style>
      .dense-field .mat-mdc-form-field-wrapper {
        padding-bottom: 0;
      }
      .dense-field .mat-mdc-form-field-infix {
        padding-top: 6px;
        padding-bottom: 6px;
        min-height: 36px;
      }
      .text-right-input input {
        text-align: right;
      }
    </style>
  `,
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
    this.contactService.getContacts().subscribe((res) => {
      // Filter for CUSTOMER type? simpler to show all for now or filter in memory
      this.customers = res.data.content;
    });

    // Load revenue accounts
    this.accountService.getAccounts().subscribe((res) => {
      this.revenueAccounts = res.data.filter((a) => a.type === 'REVENUE');
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

      const payload = {
        ...value,
        contact: { id: value.contactId }, // Backend expects contact object or contactId depending on DTO
        lines: value.lines.map((l: any) => ({
          ...l,
          revenueAccount: { id: l.revenueAccountId },
          taxRate: l.taxRateId ? { id: l.taxRateId } : null,
        })),
      };

      this.dialogRef.close(payload);
    }
  }
}
