import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InvoiceService, InvoiceFilters } from '../../../core/services/invoice.service';
import { ContactService } from '../../../core/services/contact.service';
import { Invoice } from '../../../core/models/invoice.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableFilterComponent, FilterConfig, FilterState } from '../../../shared/components/table-filter/table-filter.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../../../shared/components/payment-dialog/payment-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TableFilterComponent,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
  ],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Invoices</h2>
          <p class="text-slate-500 mt-1">Manage customer invoices and payments.</p>
        </div>
        <app-button icon="add" (onClick)="openCreateModal()">New Invoice</app-button>
      </div>

      <!-- Filters -->
      <app-table-filter
        [config]="filterConfig"
        [initialFilters]="initialFilters"
        (filterChange)="onFilterChange($event)">
      </app-table-filter>

      <!-- Results Summary -->
      <div class="flex items-center justify-between text-sm text-slate-500">
        <span>{{ invoices.length }} invoice{{ invoices.length === 1 ? '' : 's' }} found</span>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="bg-slate-50/80">
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Invoice
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Issue Date
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="relative px-6 py-4">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            <tr *ngFor="let invoice of invoices"
                class="hover:bg-primary-50/30 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-primary-600 hover:text-primary-700 cursor-pointer">
                  {{ invoice.invoiceNumber }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold mr-3">
                    {{ invoice.contact.name.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-slate-900">{{ invoice.contact.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ invoice.issueDate | date: 'MMM d, yyyy' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ invoice.dueDate | date: 'MMM d, yyyy' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900">
                {{ invoice.totalAmount | currency : invoice.currency }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span [ngClass]="{
                    'bg-accent-100 text-accent-700': invoice.status === 'PAID',
                    'bg-primary-100 text-primary-700': invoice.status === 'APPROVED' || invoice.status === 'SENT',
                    'bg-slate-100 text-slate-600': invoice.status === 'DRAFT',
                    'bg-red-100 text-red-700': invoice.status === 'VOID'
                  }"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold">
                  <span class="material-icons text-xs mr-1" *ngIf="invoice.status === 'PAID'">check_circle</span>
                  <span class="material-icons text-xs mr-1" *ngIf="invoice.status === 'APPROVED' || invoice.status === 'SENT'">verified</span>
                  <span class="material-icons text-xs mr-1" *ngIf="invoice.status === 'DRAFT'">edit_note</span>
                  <span class="material-icons text-xs mr-1" *ngIf="invoice.status === 'VOID'">cancel</span>
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button *ngIf="invoice.status === 'DRAFT'"
                        (click)="approve(invoice)"
                        class="px-3 py-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all font-semibold">
                  Approve
                </button>
                <button *ngIf="invoice.status === 'APPROVED' || invoice.status === 'SENT'"
                        (click)="pay(invoice)"
                        class="px-3 py-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all font-semibold">
                  Pay
                </button>
                <button (click)="openCreateModal(invoice)"
                        [disabled]="invoice.status !== 'DRAFT'"
                        class="px-3 py-1 text-slate-600 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-semibold">
                  {{ invoice.status === 'DRAFT' ? 'Edit' : 'Details' }}
                </button>

                <button mat-icon-button [matMenuTriggerFor]="menu"
                        class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="downloadPdf(invoice)">
                    <mat-icon>picture_as_pdf</mat-icon>
                    <span>PDF</span>
                  </button>
                  <button mat-menu-item *ngIf="invoice.status === 'DRAFT'" (click)="deleteInvoice(invoice)" class="text-red-600">
                    <mat-icon class="text-red-600">delete</mat-icon>
                    <span class="text-red-600">Delete</span>
                  </button>
                </mat-menu>
              </td>
            </tr>
            <tr *ngIf="invoices.length === 0">
              <td colspan="7" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center">
                  <div class="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <span class="material-icons text-3xl text-slate-400">description</span>
                  </div>
                  <p class="text-slate-500 font-medium">No invoices found</p>
                  <p class="text-slate-400 text-sm mt-1">{{ hasActiveFilters ? 'Try adjusting your filters' : 'Create your first invoice to get started' }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  invoices: Invoice[] = [];
  contacts: { id: string; name: string }[] = [];
  currentFilters: InvoiceFilters = {};
  hasActiveFilters = false;

  private destroy$ = new Subject<void>();

  filterConfig: FilterConfig = {
    showSearch: true,
    showStatus: true,
    showDateRange: true,
    showContact: true,
    placeholder: 'Search invoices, references...',
    statusOptions: [
      { value: 'DRAFT', label: 'Draft' },
      { value: 'SENT', label: 'Sent' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'PAID', label: 'Paid' },
      { value: 'VOID', label: 'Void' }
    ],
    contacts: []
  };

  initialFilters: Partial<FilterState> = {};

  constructor(
    private invoiceService: InvoiceService,
    private contactService: ContactService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Load contacts for filter dropdown
    this.loadContacts();

    // Parse URL query params for initial filters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initialFilters = {
        search: params['search'] || '',
        status: params['status'] ? (Array.isArray(params['status']) ? params['status'] : [params['status']]) : [],
        startDate: params['startDate'] || null,
        endDate: params['endDate'] || null,
        contactId: params['contactId'] || null
      };

      this.currentFilters = {
        search: this.initialFilters.search,
        status: this.initialFilters.status,
        startDate: this.initialFilters.startDate || undefined,
        endDate: this.initialFilters.endDate || undefined,
        contactId: this.initialFilters.contactId || undefined
      };

      this.loadInvoices();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContacts() {
    this.contactService.getContacts().subscribe({
      next: (res: { data: { content: any[] } }) => {
        this.contacts = res.data.content.map(c => ({ id: c.id, name: c.name }));
        this.filterConfig = { ...this.filterConfig, contacts: this.contacts };
      },
      error: (err: any) => console.error('Error loading contacts:', err)
    });
  }

  onFilterChange(filters: FilterState) {
    this.currentFilters = {
      search: filters.search || undefined,
      status: filters.status?.length ? filters.status : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      contactId: filters.contactId || undefined
    };

    this.hasActiveFilters = !!(
      filters.search ||
      filters.status?.length ||
      filters.startDate ||
      filters.endDate ||
      filters.contactId
    );

    // Update URL with filters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: filters.search || null,
        status: filters.status?.length ? filters.status : null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        contactId: filters.contactId || null
      },
      queryParamsHandling: 'merge'
    });

    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getInvoices(this.currentFilters).subscribe({
      next: (res: { data: { content: Invoice[] } }) =>
        (this.invoices = res.data.content),
      error: (err: any) => console.error(err),
    });
  }

  openCreateModal(invoice?: Invoice) {
    const dialogRef = this.dialog.open(InvoiceFormComponent, {
      width: '900px',
      disableClose: true,
      data: invoice || null,
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (invoice && invoice.id) {
          this.invoiceService
            .updateInvoice(invoice.id, result)
            .subscribe(() => this.loadInvoices());
        } else {
          this.invoiceService
            .createInvoice(result)
            .subscribe(() => this.loadInvoices());
        }
      }
    });
  }

  approve(invoice: Invoice) {
    if (
      confirm(
        'Are you sure you want to approve this invoice? This will post to the General Ledger.'
      )
    ) {
      this.invoiceService
        .approveInvoice(invoice.id)
        .subscribe(() => this.loadInvoices());
    }
  }

  pay(invoice: Invoice) {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '400px',
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.invoiceService
          .payInvoice(invoice.id, result)
          .subscribe(() => this.loadInvoices());
      }
    });
  }

  downloadPdf(invoice: Invoice) {
    this.invoiceService.downloadPdf(invoice.id).subscribe({
        next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
        error: (err) => console.error('Error downloading PDF', err)
    });
  }

  deleteInvoice(invoice: Invoice) {
    if (confirm('Are you sure you want to delete this draft invoice? This action cannot be undone.')) {
      this.invoiceService.deleteInvoice(invoice.id).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Error deleting invoice:', err)
      });
    }
  }
}
