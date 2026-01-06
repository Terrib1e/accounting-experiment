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
import { JournalEntryService } from '../../../core/services/journal-entry.service';
import { AccountService } from '../../../core/services/account.service';
import { JournalEntry, JournalEntryLine } from '../../../core/models/journal-entry.model';
import { Account } from '../../../core/models/account.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AbsPipe } from '../../../shared/pipes/abs.pipe';

@Component({
  selector: 'app-journal-entry-form',
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
    ButtonComponent,
    AbsPipe
  ],
  template: `
    <h2 mat-dialog-title>
        <div class="flex flex-col">
            <span>{{ data ? 'Edit' : 'New' }} Journal Entry</span>
            <span class="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1 font-sans">Ledger Entry Details</span>
        </div>
        <button mat-icon-button (click)="dialogRef.close()">
            <mat-icon>close</mat-icon>
        </button>
    </h2>

    <mat-dialog-content>
        <form [formGroup]="form" id="journal-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
            <!-- Header Fields -->
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-4 space-y-1">
                  <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Entry Date</label>
                  <div class="relative">
                    <input matInput [matDatepicker]="picker" formControlName="entryDate" class="form-input-premium pl-11">
                    <mat-datepicker-toggle matIconSuffix [for]="picker" class="absolute left-1 top-1/2 -translate-y-1/2 text-slate-400"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </div>
                </div>

                <div class="col-span-8 space-y-1">
                  <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reference Number</label>
                  <input formControlName="referenceNumber" class="form-input-premium" placeholder="e.g. JE-2024-001">
                </div>

                <div class="col-span-12 space-y-1">
                  <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea formControlName="description" rows="2" class="form-input-premium resize-none" placeholder="Provide a detailed description of this entry..."></textarea>
                </div>
            </div>

            <!-- Lines Section -->
            <div class="space-y-3">
               <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest m-0">Line Items</h3>
                  <app-button type="button" variant="secondary" size="sm" icon="add" (onClick)="addLine()">Add Line</app-button>
               </div>

               <div class="table-container shadow-sm border border-slate-200">
                  <table class="w-full text-left">
                      <thead class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                          <tr>
                              <th class="px-4 py-2 w-[35%]">Account</th>
                              <th class="px-4 py-2">Description</th>
                              <th class="px-4 py-2 w-32 text-right">Debit</th>
                              <th class="px-4 py-2 w-32 text-right">Credit</th>
                              <th class="px-4 py-2 w-10"></th>
                          </tr>
                      </thead>
                      <tbody formArrayName="lines" class="divide-y divide-slate-100">
                          <tr *ngFor="let line of lines.controls; let i=index" [formGroupName]="i" class="group hover:bg-slate-50/50 transition-colors">
                              <td class="px-2 py-2">
                                  <select formControlName="accountId" class="form-input-premium !py-1.5 !px-2 !text-sm !rounded-lg border-transparent hover:border-slate-200 bg-transparent">
                                      <option value="" disabled>Select Account</option>
                                      <option *ngFor="let acc of accounts" [value]="acc.id">
                                          {{acc.code}} - {{acc.name}}
                                      </option>
                                  </select>
                              </td>
                              <td class="px-2 py-2">
                                  <input formControlName="description" class="form-input-premium !py-1.5 !px-2 !text-sm !rounded-lg border-transparent hover:border-slate-200 bg-transparent" placeholder="Line description">
                              </td>
                              <td class="px-2 py-2 text-right">
                                  <input type="number" formControlName="debit" class="form-input-premium !py-1.5 !px-2 !text-sm !rounded-lg border-transparent hover:border-slate-200 bg-transparent text-right font-bold text-slate-700" placeholder="0.00">
                              </td>
                              <td class="px-2 py-2 text-right">
                                  <input type="number" formControlName="credit" class="form-input-premium !py-1.5 !px-2 !text-sm !rounded-lg border-transparent hover:border-slate-200 bg-transparent text-right font-bold text-slate-700" placeholder="0.00">
                              </td>
                              <td class="px-2 py-2 text-center">
                                  <button type="button" (click)="removeLine(i)" class="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                      <mat-icon class="!text-[18px] !w-[18px] !h-[18px] leading-[18px]">delete_outline</mat-icon>
                                  </button>
                              </td>
                          </tr>
                      </tbody>
                      <tfoot class="bg-slate-50/50 border-t border-slate-200 text-xs font-bold">
                          <tr>
                              <td colspan="2" class="px-4 py-3 uppercase tracking-widest text-slate-400">Total Balance</td>
                              <td class="px-4 py-3 text-right" [class.text-red-500]="totals.debit !== totals.credit">
                                  {{totals.debit | currency}}
                              </td>
                              <td class="px-4 py-3 text-right" [class.text-red-500]="totals.debit !== totals.credit">
                                  {{totals.credit | currency}}
                              </td>
                              <td></td>
                          </tr>
                      </tfoot>
                  </table>
               </div>
            </div>

            <div *ngIf="totals.debit !== totals.credit" class="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 text-xs font-bold flex items-center gap-3 animate-slide-up">
              <div class="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                 <mat-icon class="text-red-600 !text-xs !w-3 !h-3 leading-3">priority_high</mat-icon>
              </div>
              <span class="uppercase tracking-widest">Out of balance by {{ (totals.debit - totals.credit) | abs | currency }}</span>
            </div>
        </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
        <app-button variant="secondary" (onClick)="dialogRef.close()">Discard</app-button>
        <app-button variant="primary" (onClick)="onSubmit()" [disabled]="form.invalid || totals.debit !== totals.credit">
            Post Journal Entry
        </app-button>
    </mat-dialog-actions>
  `
})

export class JournalEntryFormComponent implements OnInit {
  form: FormGroup;
  accounts: Account[] = [];

  constructor(
    private fb: FormBuilder,
    private journalEntryService: JournalEntryService,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<JournalEntryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: JournalEntry | null
  ) {
    this.form = this.fb.group({
      entryDate: [new Date(), Validators.required],
      referenceNumber: [''],
      description: ['', Validators.required],
      lines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Fetch accounts
    this.accountService.getAccounts().subscribe(res => {
        this.accounts = res.data;
    });

    if (this.data) {
      this.form.patchValue({
          entryDate: this.data.entryDate,
          referenceNumber: this.data.referenceNumber,
          description: this.data.description
      });
      if (this.data.lines) {
          this.data.lines.forEach(line => this.addLine(line));
      }
    } else {
        // Add 2 default lines
        this.addLine();
        this.addLine();
    }
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  addLine(line?: JournalEntryLine) {
    const lineGroup = this.fb.group({
      accountId: [line?.accountId || '', Validators.required],
      description: [line?.description || ''],
      debit: [line?.debit || 0, [Validators.min(0)]],
      credit: [line?.credit || 0, [Validators.min(0)]]
    });

    // Validate that either debit OR credit is > 0, but usually both checks handled elsewhere or logic
    this.lines.push(lineGroup);
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
  }

  get totals() {
      const lines = this.form.value.lines as {debit: number, credit: number}[];
      if (!lines) return { debit: 0, credit: 0 };
      const debit = lines.reduce((acc, curr) => acc + (curr.debit || 0), 0);
      const credit = lines.reduce((acc, curr) => acc + (curr.credit || 0), 0);
      return { debit, credit };
  }

  onSubmit(): void {
    if (this.form.valid && this.totals.debit === this.totals.credit) {
        this.dialogRef.close(this.form.value);
    }
  }
}
