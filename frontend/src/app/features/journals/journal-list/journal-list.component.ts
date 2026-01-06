import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JournalEntryFormComponent } from '../journal-entry-form/journal-entry-form.component';
import { JournalEntryService } from '../../../core/services/journal-entry.service';
import { JournalEntry } from '../../../core/models/journal-entry.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-journal-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatDialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex items-end justify-between">
        <div>
           <h2 class="text-3xl font-bold text-slate-900 leading-tight">Journal Entries</h2>
           <p class="text-slate-500 mt-2 font-medium">Manage and review your manual ledger entries with precision.</p>
        </div>
        <app-button icon="add" (onClick)="openCreateModal()">New Entry</app-button>
      </div>

      <!-- Stats context - Optional but adds "fintech" feel -->
      <div class="grid grid-cols-4 gap-6">
        <div class="premium-card p-5 bg-gradient-to-br from-white to-slate-50 border-l-4 border-primary-500">
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Entries</p>
           <p class="text-2xl font-bold text-slate-800">{{ entries.length }}</p>
        </div>
        <div class="premium-card p-5 bg-gradient-to-br from-white to-slate-50 border-l-4 border-accent-500">
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted This Month</p>
           <p class="text-2xl font-bold text-slate-800">{{ getPostedCount() }}</p>
        </div>
      </div>

      <!-- Table Container -->
      <div class="table-container">
        <table class="table-premium">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Ref #</th>
              <th scope="col">Description</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of entries" class="group">
              <td class="whitespace-nowrap font-medium text-slate-500">
                {{ entry.entryDate | date: 'MMM d, yyyy' }}
              </td>
              <td class="whitespace-nowrap">
                <span class="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold text-xs">
                  {{ entry.referenceNumber || 'N/A' }}
                </span>
              </td>
              <td class="max-w-md">
                <p class="truncate text-slate-600 font-medium">{{ entry.description }}</p>
              </td>
              <td class="whitespace-nowrap">
                 <span class="status-badge" [ngClass]="{
                    'posted': entry.status === 'POSTED',
                    'approved': entry.status === 'APPROVED',
                    'draft': entry.status === 'DRAFT',
                    'void': entry.status === 'VOID'
                 }">
                   <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                   <span>{{ entry.status }}</span>
                 </span>
              </td>
              <td class="whitespace-nowrap text-right">
                <div class="flex items-center justify-end space-x-1">
                  <app-button *ngIf="entry.status === 'DRAFT'"
                          variant="ghost" size="sm" icon="check_circle"
                          (onClick)="approveEntry(entry)">
                    Approve
                  </app-button>
                  <app-button *ngIf="entry.status === 'APPROVED'"
                          variant="ghost" size="sm" icon="send"
                          (onClick)="postEntry(entry)">
                    Post
                  </app-button>
                  <app-button *ngIf="entry.status === 'DRAFT'"
                          variant="ghost" size="sm" icon="delete"
                          class="text-red-500 hover:text-red-600 hover:bg-red-50"
                          (onClick)="deleteEntry(entry)">
                    Delete
                  </app-button>
                  <app-button variant="ghost" size="sm" [icon]="entry.status === 'DRAFT' ? 'edit' : 'visibility'"
                          (onClick)="openCreateModal(entry)"
                          [disabled]="entry.status !== 'DRAFT' && entry.status !== 'APPROVED'">
                    {{ entry.status === 'DRAFT' ? 'Edit' : 'View' }}
                  </app-button>
                </div>
              </td>
            </tr>
            <tr *ngIf="entries.length === 0">
               <td colspan="5" class="py-24 text-center">
                  <div class="flex flex-col items-center">
                    <div class="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                      <span class="material-icons text-4xl text-slate-300">history_edu</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800">No entries yet</h3>
                    <p class="text-slate-400 max-w-xs mt-2">Start your manual ledger by creating your first journal entry.</p>
                    <div class="mt-8">
                      <app-button icon="add" (onClick)="openCreateModal()">Create Entry</app-button>
                    </div>
                  </div>
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class JournalListComponent implements OnInit {
  entries: JournalEntry[] = [];

  constructor(
    private journalService: JournalEntryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    this.journalService.getEntries().subscribe({
        next: (res: any) => {
             this.entries = res.data.content || [];
        },
        error: (err: any) => console.error(err)
    });
  }

  getPostedCount(): number {
    return this.entries.filter(e => e.status === 'POSTED').length;
  }

  openCreateModal(entry?: JournalEntry) {
      const dialogRef = this.dialog.open(JournalEntryFormComponent, {
          width: '1000px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: true,
          data: entry || null,
          panelClass: 'premium-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              if (entry && entry.id) {
                  this.journalService.updateEntry(entry.id, result).subscribe(() => this.loadEntries());
              } else {
                  this.journalService.createEntry(result).subscribe(() => this.loadEntries());
              }
          }
      });
  }

  approveEntry(entry: JournalEntry) {
    if (!entry.id) return;
    this.journalService.approve(entry.id).subscribe({
      next: () => this.loadEntries(),
      error: (err) => console.error('Error approving entry:', err)
    });
  }

  postEntry(entry: JournalEntry) {
    if (!entry.id) return;
    this.journalService.post(entry.id).subscribe({
      next: () => this.loadEntries(),
      error: (err) => console.error('Error posting entry:', err)
    });
  }

  deleteEntry(entry: JournalEntry) {
    if (!entry.id) return;
    if (confirm('Are you sure you want to delete this draft entry? This action cannot be undone.')) {
      this.journalService.deleteEntry(entry.id).subscribe({
        next: () => this.loadEntries(),
        error: (err) => console.error('Error deleting entry:', err)
      });
    }
  }
}
