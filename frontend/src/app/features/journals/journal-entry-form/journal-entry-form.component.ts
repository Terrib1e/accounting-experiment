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
    <div class="premium-dialog flex flex-col h-full bg-white text-slate-900">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 bg-white">
            <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                    <mat-icon class="text-white scale-90">{{ data ? 'edit_note' : 'post_add' }}</mat-icon>
                </div>
                <div class="flex flex-col">
                    <h2 class="text-slate-900 text-lg font-bold tracking-tight leading-none m-0">{{ data ? 'Edit' : 'New' }} Journal Entry</h2>
                    <span class="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span> General Ledger Transaction
                    </span>
                </div>
            </div>
            <button mat-icon-button (click)="dialogRef.close()" class="hover:bg-slate-50 transition-all rounded-xl text-slate-400">
                <mat-icon>close</mat-icon>
            </button>
        </div>

    <mat-dialog-content class="!p-0 !m-0 bg-slate-50/30">
        <form [formGroup]="form" id="journal-form" (ngSubmit)="onSubmit()" class="flex flex-col gap-10 p-8">

            <!-- Metadata Section -->
            <div class="space-y-4">
                <div class="flex items-center gap-2 px-1">
                    <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Entry Metadata</label>
                </div>
                <div class="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-12 gap-5">
                    <div class="col-span-12 md:col-span-4">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Posting Date</mat-label>
                            <input matInput [matDatepicker]="picker" formControlName="entryDate" required>
                            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                            <mat-datepicker #picker></mat-datepicker>
                        </mat-form-field>
                    </div>

                    <div class="col-span-12 md:col-span-8">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Reference Number</mat-label>
                            <input matInput formControlName="referenceNumber" placeholder="e.g. JE-2024-001">
                        </mat-form-field>
                    </div>

                    <div class="col-span-12">
                        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                            <mat-label>Internal Memo / Description</mat-label>
                            <textarea matInput formControlName="description" rows="2" class="resize-none" placeholder="Provide a detailed explanation for this manual entry..."></textarea>
                        </mat-form-field>
                    </div>
                </div>
            </div>

            <!-- Lines Section -->
            <div class="space-y-4">
                <div class="flex items-center justify-between px-1">
                    <div class="flex items-center gap-2">
                        <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Double Entry Ledger</label>
                    </div>
                    <button mat-stroked-button type="button" (click)="addLine()" class="!rounded-xl !border-slate-200 !text-slate-600 hover:!bg-slate-50 !font-bold !text-[11px] !py-1 h-8">
                        <mat-icon class="!text-sm !w-4 !h-4 !min-w-[16px] !min-h-[16px] !m-0">add</mat-icon>
                        <span class="ml-1 uppercase">Add Line</span>
                    </button>
                </div>

                <div class="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm mx-1">
                   <table class="w-full text-left border-collapse">
                       <thead>
                           <tr class="bg-slate-50 border-b border-slate-100">
                               <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Account</th>
                               <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                               <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 text-right">Debit</th>
                               <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 text-right">Credit</th>
                               <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12 text-center"></th>
                           </tr>
                       </thead>
                       <tbody formArrayName="lines" class="divide-y divide-slate-50">
                           <tr *ngFor="let line of lines.controls; let i=index" [formGroupName]="i" class="group hover:bg-slate-50/40 transition-colors">
                               <td class="px-4 py-3">
                                   <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                       <mat-select formControlName="accountId" placeholder="Select Account" required>
                                           <mat-option *ngFor="let acc of accounts" [value]="acc.id">
                                               <div class="flex items-center gap-2">
                                                   <span class="px-2 py-0.5 bg-slate-100 text-[10px] font-mono rounded-md text-slate-600 font-bold uppercase">{{acc.code}}</span>
                                                   <span class="text-sm text-slate-700">{{acc.name}}</span>
                                               </div>
                                           </mat-option>
                                       </mat-select>
                                   </mat-form-field>
                               </td>
                               <td class="px-4 py-3">
                                   <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                       <input matInput formControlName="description" placeholder="Line detail">
                                   </mat-form-field>
                               </td>
                               <td class="px-4 py-3">
                                   <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                       <input matInput type="number" formControlName="debit" class="text-right font-bold text-emerald-600">
                                   </mat-form-field>
                               </td>
                               <td class="px-4 py-3">
                                   <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                                       <input matInput type="number" formControlName="credit" class="text-right font-bold text-rose-600">
                                   </mat-form-field>
                               </td>
                               <td class="px-4 py-3 text-center">
                                   <button type="button" mat-icon-button (click)="removeLine(i)"
                                           class="text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                           [disabled]="lines.length <= 2">
                                       <mat-icon class="!text-lg">delete_outline</mat-icon>
                                   </button>
                               </td>
                           </tr>
                       </tbody>
                       <tfoot class="bg-primary-950 border-t border-primary-900 text-white">
                           <tr>
                               <td colspan="2" class="px-8 py-6">
                                      <div class="flex items-center gap-4">
                                          <div [class.bg-emerald-500]="totals.debit === totals.credit"
                                               [class.bg-rose-500]="totals.debit !== totals.credit"
                                               class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors border border-white/10">
                                              <mat-icon class="text-white !text-lg">{{ totals.debit === totals.credit ? 'balance' : 'warning' }}</mat-icon>
                                          </div>
                                          <div class="flex flex-col">
                                              <span class="text-[10px] text-primary-400 uppercase tracking-widest font-bold">Ledger Balance Status</span>
                                              <span class="text-xs font-bold" [class.text-emerald-400]="totals.debit === totals.credit" [class.text-rose-400]="totals.debit !== totals.credit">
                                                  {{ totals.debit === totals.credit ? 'Journal Entries Balanced' : 'Out of Balance: ' + ((totals.debit - totals.credit) | abs | currency) }}
                                              </span>
                                          </div>
                                      </div>
                               </td>
                               <td class="px-6 py-6 text-right border-l border-white/5">
                                   <div class="flex flex-col items-end">
                                       <span class="text-[10px] text-primary-400 uppercase tracking-widest font-bold">Total Debits</span>
                                       <span class="text-xl font-bold tracking-tight text-white">{{ totals.debit | currency }}</span>
                                   </div>
                               </td>
                               <td class="px-6 py-6 text-right">
                                   <div class="flex flex-col items-end">
                                       <span class="text-[10px] text-primary-400 uppercase tracking-widest font-bold">Total Credits</span>
                                       <span class="text-xl font-bold tracking-tight text-white">{{ totals.credit | currency }}</span>
                                   </div>
                               </td>
                               <td></td>
                           </tr>
                       </tfoot>
                   </table>
                </div>
            </div>

            <div *ngIf="totals.debit !== totals.credit"
                 class="mx-1 bg-rose-50 text-rose-700 px-6 py-4 rounded-2xl border border-rose-100 text-[10px] font-bold flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div class="flex items-center gap-3">
                    <mat-icon class="text-rose-500 !text-lg !w-5 !h-5">warning</mat-icon>
                    <span class="uppercase tracking-[0.15em]">ENTRY MUST BE BALANCED TO POST TO THE LEDGER</span>
                </div>
                <span class="bg-rose-100 px-3 py-1 rounded-full font-mono">VARIANCE: {{ (totals.debit - totals.credit) | abs | currency }}</span>
            </div>
        </form>
    </mat-dialog-content>

    <mat-dialog-actions class="!px-8 !py-6 bg-white border-t border-slate-100">
        <button mat-button (click)="dialogRef.close()" class="!rounded-xl !px-6 h-12 !text-slate-500 hover:bg-slate-50 font-bold transition-all">Discard</button>
        <button mat-flat-button color="primary"
                (click)="onSubmit()"
                [disabled]="form.invalid || totals.debit !== totals.credit"
                class="!min-w-[200px] !bg-primary-600 !text-white !rounded-xl !h-12 shadow-xl shadow-primary-500/10 hover:shadow-xl transition-all font-bold">
            <div class="flex items-center justify-center gap-2">
                <mat-icon class="!text-lg">vignette</mat-icon>
                <span class="tracking-tight">Post Journal Entry</span>
            </div>
        </button>
    </mat-dialog-actions>
    </div>
  `,
  styles: [`
    ::ng-deep .premium-dialog .mat-mdc-dialog-content {
      overflow-x: hidden !important;
    }
  `]
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
