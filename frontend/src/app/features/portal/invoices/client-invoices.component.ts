import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  amountDue: number;
  status: string;
}

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">My Invoices</h1>
          <p class="text-slate-500 font-medium">View and manage your invoices and payment history</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Filter Tabs -->
          <div class="flex bg-slate-100 rounded-xl p-1">
            <button (click)="setFilter('all')"
                    [class]="filterStatus === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              All
            </button>
            <button (click)="setFilter('outstanding')"
                    [class]="filterStatus === 'outstanding' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              Outstanding
            </button>
            <button (click)="setFilter('paid')"
                    [class]="filterStatus === 'paid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              Paid
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Total Outstanding -->
        <div class="premium-card p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Outstanding</p>
              <p class="text-2xl font-bold text-amber-700 mt-1">{{ totalOutstanding | currency }}</p>
              <p class="text-xs text-amber-600/80 mt-1">{{ outstandingCount }} invoice(s)</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <span class="material-icons text-amber-600">pending_actions</span>
            </div>
          </div>
        </div>

        <!-- Overdue -->
        <div class="premium-card p-5 bg-gradient-to-br from-red-50 to-rose-50 border-red-200/60">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-red-600 uppercase tracking-widest">Overdue</p>
              <p class="text-2xl font-bold text-red-700 mt-1">{{ totalOverdue | currency }}</p>
              <p class="text-xs text-red-600/80 mt-1">{{ overdueCount }} invoice(s)</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <span class="material-icons text-red-600">warning</span>
            </div>
          </div>
        </div>

        <!-- Total Paid -->
        <div class="premium-card p-5 bg-gradient-to-br from-accent-50 to-emerald-50 border-accent-200/60">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-accent-600 uppercase tracking-widest">Paid This Year</p>
              <p class="text-2xl font-bold text-accent-700 mt-1">{{ totalPaid | currency }}</p>
              <p class="text-xs text-accent-600/80 mt-1">{{ paidCount }} invoice(s)</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <span class="material-icons text-accent-600">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="table-container">
        <div class="p-8 space-y-4">
          <div class="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
          <div class="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
          <div class="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Invoice Table -->
      <div *ngIf="!loading" class="table-container">
        <table class="table-premium">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of filteredInvoices" class="group">
              <td>
                <span class="font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
                  {{ inv.invoiceNumber }}
                </span>
              </td>
              <td>{{ inv.issueDate | date:'mediumDate' }}</td>
              <td>
                <span [class]="isOverdue(inv) ? 'text-red-600 font-semibold' : ''">
                  {{ inv.dueDate | date:'mediumDate' }}
                </span>
                <span *ngIf="isOverdue(inv)" class="ml-2 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">OVERDUE</span>
              </td>
              <td class="font-semibold text-slate-900">{{ inv.totalAmount | currency }}</td>
              <td>
                <span [class]="inv.amountDue > 0 ? 'font-semibold text-amber-600' : 'text-slate-400'">
                  {{ inv.amountDue | currency }}
                </span>
              </td>
              <td>
                <span [class]="getStatusClass(inv.status)">
                  {{ inv.status }}
                </span>
              </td>
              <td>
                <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center space-x-1 transition-colors">
                    <span class="material-icons text-sm">visibility</span>
                    <span>View</span>
                  </button>
                  <button class="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center space-x-1 transition-colors">
                    <span class="material-icons text-sm">download</span>
                    <span>PDF</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredInvoices.length === 0" class="p-12 text-center">
          <div class="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <span class="material-icons text-slate-400 text-3xl">receipt_long</span>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">No Invoices Found</h3>
          <p class="text-sm text-slate-500">
            {{ filterStatus === 'all' ? 'You don\\'t have any invoices yet.' : 'No ' + filterStatus + ' invoices to display.' }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class ClientInvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = true;
  filterStatus: 'all' | 'outstanding' | 'paid' = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Invoice[]>(`${environment.apiUrl}/portal/invoices`).subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load invoices', err);
        this.loading = false;
      }
    });
  }

  get filteredInvoices(): Invoice[] {
    switch (this.filterStatus) {
      case 'outstanding':
        return this.invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE');
      case 'paid':
        return this.invoices.filter(i => i.status === 'PAID');
      default:
        return this.invoices;
    }
  }

  get totalOutstanding(): number {
    return this.invoices
      .filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + (i.amountDue || 0), 0);
  }

  get outstandingCount(): number {
    return this.invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').length;
  }

  get totalOverdue(): number {
    return this.invoices
      .filter(i => i.status === 'OVERDUE' || this.isOverdue(i))
      .reduce((sum, i) => sum + (i.amountDue || 0), 0);
  }

  get overdueCount(): number {
    return this.invoices.filter(i => i.status === 'OVERDUE' || this.isOverdue(i)).length;
  }

  get totalPaid(): number {
    return this.invoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  }

  get paidCount(): number {
    return this.invoices.filter(i => i.status === 'PAID').length;
  }

  setFilter(status: 'all' | 'outstanding' | 'paid'): void {
    this.filterStatus = status;
  }

  isOverdue(invoice: Invoice): boolean {
    if (invoice.status === 'PAID' || invoice.status === 'VOID') return false;
    const dueDate = new Date(invoice.dueDate);
    return dueDate < new Date();
  }

  getStatusClass(status: string): string {
    const base = 'status-badge';
    switch (status) {
      case 'PAID': return `${base} bg-accent-100 text-accent-700`;
      case 'SENT': return `${base} bg-blue-100 text-blue-700`;
      case 'OVERDUE': return `${base} bg-red-100 text-red-700`;
      case 'DRAFT': return `${base} bg-slate-100 text-slate-600`;
      case 'VOID': return `${base} bg-slate-100 text-slate-400`;
      default: return `${base} bg-slate-100 text-slate-600`;
    }
  }
}
