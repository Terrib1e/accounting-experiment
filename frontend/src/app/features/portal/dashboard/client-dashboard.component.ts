import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortalService, ClientDashboardDto } from '../../../core/services/portal.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, StatCardComponent],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Welcome Section -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center space-x-3">
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span class="text-white text-xl font-bold">{{ getInitials(dashboard?.contactName) }}</span>
            </div>
            <div>
              <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, {{ dashboard?.contactName || 'Client' }}
              </h1>
              <p class="text-slate-500 font-medium">Here's an overview of your account activity</p>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="hidden sm:flex flex-col items-end border-r border-slate-200 pr-4">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Updated</span>
            <span class="text-sm font-semibold text-slate-700">{{ currentDate | date:'medium' }}</span>
          </div>
          <button class="btn-secondary flex items-center space-x-2">
            <span class="material-icons text-lg">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="h-36 bg-slate-100 rounded-2xl animate-pulse"></div>
        <div class="h-36 bg-slate-100 rounded-2xl animate-pulse"></div>
        <div class="h-36 bg-slate-100 rounded-2xl animate-pulse"></div>
        <div class="h-36 bg-slate-100 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Stats Grid -->
      <div *ngIf="!loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card
          title="Outstanding Invoices"
          [value]="(dashboard?.outstandingInvoices || 0).toString()"
          icon="receipt_long"
          type="warning"
          [trend]="(dashboard?.totalOutstandingAmount | currency) || '$0.00'"
          trendLabel="total due">
        </app-stat-card>

        <app-stat-card
          title="Active Jobs"
          [value]="(dashboard?.activeJobs || 0).toString()"
          icon="work"
          type="success"
          trend="In Progress"
          trendLabel="status">
        </app-stat-card>

        <app-stat-card
          title="New Documents"
          [value]="(dashboard?.unreadDocuments || 0).toString()"
          icon="folder_open"
          type="info"
          trend="Unread"
          trendLabel="files">
        </app-stat-card>

        <app-stat-card
          title="Account Status"
          value="Active"
          icon="verified"
          type="success"
          trend="Good Standing"
          trendLabel="">
        </app-stat-card>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-1 space-y-6">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Quick Actions</h3>
          </div>

          <div class="space-y-4">
            <!-- View Invoices -->
            <a routerLink="/portal/invoices"
               class="group relative flex items-center p-5 premium-card border-none bg-gradient-to-br from-primary-600 to-indigo-700 overflow-hidden shadow-primary-glow hover:shadow-primary-500/40 transform hover:-translate-y-1 transition-all duration-300">
              <div class="absolute -right-6 -top-6 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <span class="material-icons !text-9xl">receipt_long</span>
              </div>
              <div class="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mr-5 backdrop-blur-md shadow-inner border border-white/10 group-hover:bg-white/30 transition-colors">
                <span class="material-icons text-white text-3xl">visibility</span>
              </div>
              <div class="relative z-10">
                <span class="text-lg font-bold text-white tracking-wide block">View Invoices</span>
                <p class="text-indigo-100 text-xs font-medium mt-0.5">Check payment status</p>
              </div>
            </a>

            <!-- Track Work -->
            <a routerLink="/portal/jobs"
               class="group relative flex items-center p-5 premium-card border-none bg-gradient-to-br from-accent-600 to-accent-700 overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div class="absolute -right-6 -top-6 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <span class="material-icons !text-9xl">work</span>
              </div>
              <div class="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mr-5 backdrop-blur-md shadow-inner border border-white/10 group-hover:bg-white/30 transition-colors">
                <span class="material-icons text-white text-3xl">timeline</span>
              </div>
              <div class="relative z-10">
                <span class="text-lg font-bold text-white tracking-wide block">Track Progress</span>
                <p class="text-accent-100 text-xs font-medium mt-0.5">View work status</p>
              </div>
            </a>

            <!-- Get Help -->
            <div class="grid grid-cols-2 gap-4">
              <button class="premium-card p-5 group flex flex-col items-center justify-center h-32 hover:border-primary-400 cursor-pointer bg-white">
                <div class="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-primary-50 group-hover:scale-110 transition-all duration-300">
                  <span class="material-icons text-slate-400 group-hover:text-primary-600 text-2xl">chat</span>
                </div>
                <span class="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary-600 transition-colors">Support</span>
              </button>
              <button class="premium-card p-5 group flex flex-col items-center justify-center h-32 hover:border-primary-400 cursor-pointer bg-white">
                <div class="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-primary-50 group-hover:scale-110 transition-all duration-300">
                  <span class="material-icons text-slate-400 group-hover:text-primary-600 text-2xl">description</span>
                </div>
                <span class="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary-600 transition-colors">Documents</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Activity & Info Section -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Account Summary</h3>
          </div>

          <!-- Info Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Outstanding Balance -->
            <div class="premium-card p-6 bg-white">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding</p>
                  <p class="text-3xl font-bold text-slate-900 mt-1">{{ dashboard?.totalOutstandingAmount | currency }}</p>
                </div>
                <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span class="material-icons text-white">account_balance_wallet</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500">{{ dashboard?.outstandingInvoices || 0 }} invoice(s)</span>
                <a routerLink="/portal/invoices" class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center">
                  View Details <span class="material-icons text-sm ml-1">arrow_forward</span>
                </a>
              </div>
            </div>

            <!-- Active Projects -->
            <div class="premium-card p-6 bg-white">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Projects</p>
                  <p class="text-3xl font-bold text-slate-900 mt-1">{{ dashboard?.activeJobs || 0 }}</p>
                </div>
                <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
                  <span class="material-icons text-white">engineering</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500">In progress</span>
                <a routerLink="/portal/jobs" class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center">
                  Track Progress <span class="material-icons text-sm ml-1">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Recent Updates Section -->
          <div class="premium-card overflow-hidden bg-white">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 class="text-sm font-bold text-slate-800">Recent Updates</h4>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 30 days</span>
            </div>
            <div class="divide-y divide-slate-50">
              <!-- Placeholder items -->
              <div class="flex items-center p-5 hover:bg-slate-50/50 transition-colors">
                <div class="h-10 w-10 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center mr-4">
                  <span class="material-icons text-accent-600 text-lg">check_circle</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-slate-800">Account Verified</p>
                  <p class="text-xs text-slate-500">Your account is in good standing</p>
                </div>
                <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Today</span>
              </div>
              <div class="flex items-center p-5 hover:bg-slate-50/50 transition-colors">
                <div class="h-10 w-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mr-4">
                  <span class="material-icons text-primary-600 text-lg">update</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-slate-800">Portal Access Granted</p>
                  <p class="text-xs text-slate-500">Welcome to your client portal</p>
                </div>
                <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Recent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  dashboard: ClientDashboardDto | null = null;
  loading = true;
  currentDate = new Date();

  constructor(private portalService: PortalService) {}

  ngOnInit(): void {
    this.portalService.getDashboard().subscribe({
      next: (data: ClientDashboardDto) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load dashboard', err);
        this.loading = false;
      }
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'CU';
    const parts = name.split(' ');
    return parts.map(p => p.charAt(0)).join('').toUpperCase().substring(0, 2);
  }
}
