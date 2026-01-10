import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { RouterLink, Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardStats, ActivityItem } from './dashboard.model';
import { Observable } from 'rxjs';

@Component({

  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      <!-- Welcome Section -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h2>
          <p class="text-slate-500 font-medium">Welcome back, John. Here's your business at a glance.</p>
        </div>
        <div class="flex items-center space-x-6">
          <div class="hidden sm:flex flex-col items-end border-r border-slate-200 pr-6">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Time</span>
            <span class="text-sm font-semibold text-slate-700 font-mono">{{ currentDate | date:'fullDate' }}</span>
          </div>
          <button (click)="draftReport()" class="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
             Draft Report
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" *ngIf="stats$ | async as stats; else loadingStats">
        <app-stat-card
            title="Total Revenue"
            [value]="(stats.data.totalRevenue | currency) || '$0.00'"
            icon="trending_up"
            type="success"
            [trend]="stats.data.revenueTrend"
            trendDirection="up">
        </app-stat-card>

        <app-stat-card
            title="Outstanding"
            [value]="(stats.data.outstandingInvoices | currency) || '$0.00'"
            icon="receipt"
            type="warning"
            [trend]="stats.data.outstandingTrend"
            trendLabel="invoices">
        </app-stat-card>

        <app-stat-card
            title="Total Expenses"
            [value]="(stats.data.totalExpenses | currency) || '$0.00'"
            icon="payments"
            type="danger"
            [trend]="stats.data.expenseTrend"
            trendDirection="down">
        </app-stat-card>

        <app-stat-card
            title="Net Cash"
            [value]="(stats.data.netCash | currency) || '$0.00'"
            icon="account_balance"
            type="info"
            [trend]="stats.data.netCashTrend"
            trendDirection="up">
        </app-stat-card>
      </div>

      <ng-template #loadingStats>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
              <div class="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
              <div class="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
              <div class="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
          </div>
      </ng-template>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-1 flex flex-col space-y-6">
          <div class="flex items-center justify-between px-1">
             <h3 class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Global Actions</h3>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <!-- New Invoice - Premium Gradient Card -->
            <a routerLink="/invoices"
               class="group relative flex items-center p-5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1.5 transition-all duration-300"
               style="background: linear-gradient(135deg, #5850ec 0%, #4338ca 50%, #3730a3 100%);">
              <!-- Animated Gradient Border -->
              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <!-- Floating Icon Background -->
              <div class="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                <span class="material-icons !text-[140px]">receipt</span>
              </div>
              <div class="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mr-5 backdrop-blur-md shadow-inner border border-white/20 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                <span class="material-icons text-white text-3xl">add</span>
              </div>
              <div class="relative z-10">
                <span class="text-lg font-bold text-white tracking-wide block">New Invoice</span>
                <p class="text-indigo-200 text-xs font-medium mt-0.5 flex items-center">
                  Create & send to client
                  <span class="ml-2 material-icons text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                </p>
              </div>
            </a>

            <!-- Record Expense - Dark Premium Card -->
            <a routerLink="/expenses"
               class="group relative flex items-center p-5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1.5 transition-all duration-300"
               style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
              <!-- Shimmer Effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <!-- Floating Icon -->
              <div class="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                <span class="material-icons !text-[140px]">payments</span>
              </div>
              <div class="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mr-5 backdrop-blur-md shadow-inner border border-white/10 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                <span class="material-icons text-white text-3xl">upload</span>
              </div>
              <div class="relative z-10">
                <span class="text-lg font-bold text-white tracking-wide block">Record Expense</span>
                <p class="text-slate-400 text-xs font-medium mt-0.5 flex items-center">
                  Upload receipt & categorize
                  <span class="ml-2 material-icons text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                </p>
              </div>
            </a>

            <!-- Quick Links Grid -->
            <div class="grid grid-cols-2 gap-4">
                <a routerLink="/journals" class="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 flex flex-col items-center justify-center h-40 hover:border-primary-300 hover:shadow-stat-glow-info cursor-pointer transition-all duration-300">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/50 group-hover:to-primary-100/30 transition-all duration-300"></div>
                  <div class="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300 relative z-10">
                    <span class="material-icons text-slate-400 group-hover:text-primary-600 text-2xl transition-colors">edit_note</span>
                  </div>
                  <span class="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary-600 transition-colors relative z-10">Journal</span>
                </a>
                <a routerLink="/contacts" class="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 flex flex-col items-center justify-center h-40 hover:border-primary-300 hover:shadow-stat-glow-info cursor-pointer transition-all duration-300">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/50 group-hover:to-primary-100/30 transition-all duration-300"></div>
                  <div class="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300 relative z-10">
                    <span class="material-icons text-slate-400 group-hover:text-primary-600 text-2xl transition-colors">group_add</span>
                  </div>
                  <span class="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary-600 transition-colors relative z-10">Client</span>
                </a>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="lg:col-span-2 flex flex-col space-y-6">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Timeline</h3>
            <button routerLink="/journals" class="text-[10px] font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors flex items-center group">
               View General Ledger
               <span class="material-icons text-[10px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div class="rounded-2xl border border-slate-200/60 bg-white divide-y divide-slate-100/80 overflow-hidden shadow-fintech-card" *ngIf="stats$ | async as stats; else loadingActivity">
            <div *ngFor="let item of stats.data.recentActivity; let i = index"
                 class="group flex items-center p-5 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all duration-300 cursor-pointer relative"
                 (click)="navigateToItem(item)"
                 [style.animation-delay]="(i * 0.05) + 's'">
              <!-- Hover Accent Line -->
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r"></div>

              <!-- Status Pulse Indicator -->
              <div class="relative mr-5">
                <div [class]="'h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ' + getIconBgClass(item.type)">
                  <span [class]="'material-icons ' + item.colorClass">{{ item.icon }}</span>
                </div>
                <!-- Pulse dot for recent items -->
                <div *ngIf="i < 2" class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent-400 border-2 border-white animate-pulse-glow"></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{{ item.title }}</p>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">{{ item.date | date:'shortTime' }}</span>
                    <span class="material-icons text-slate-300 text-sm group-hover:text-primary-400 group-hover:translate-x-1 transition-all">arrow_forward</span>
                  </div>
                </div>
                <p class="text-xs text-slate-500 font-medium truncate flex items-center">
                   <span class="font-semibold text-slate-700">{{ item.subtitle }}</span>
                   <span class="mx-2 h-1 w-1 rounded-full bg-slate-300" *ngIf="item.amount"></span>
                   <span class="font-mono text-slate-900 text-sm font-bold bg-slate-100 px-2 py-0.5 rounded" *ngIf="item.amount != null">{{ item.amount | currency }}</span>
                </p>
              </div>
            </div>

            <div *ngIf="stats.data.recentActivity.length === 0" class="p-8 text-center text-slate-400 text-sm">
                No recent activity found.
            </div>
          </div>

          <ng-template #loadingActivity>
              <div class="rounded-2xl border border-slate-200/60 bg-white p-6 space-y-4">
                  <div class="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                  <div class="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                  <div class="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
              </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentDate = new Date();
  stats$!: Observable<{data: DashboardStats}>;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.stats$ = this.dashboardService.getStats();
  }

  draftReport() {
    this.router.navigate(['/reports']);
  }

  getIconBgClass(type: string): string {
      switch(type) {
          case 'INVOICE': return 'bg-accent-50 border-accent-100';
          case 'EXPENSE': return 'bg-red-50 border-red-100';
          case 'CONTACT': return 'bg-purple-50 border-purple-100';
          default: return 'bg-slate-50 border-slate-100';
      }
  }

  navigateToItem(item: ActivityItem): void {
    const routeMap: Record<string, string> = {
      'INVOICE': '/invoices',
      'EXPENSE': '/expenses',
      'JOURNAL': '/journals',
      'CONTACT': '/contacts',
      'PAYMENT': '/invoices'  // Payments relate to invoices
    };

    const baseRoute = routeMap[item.type] || '/dashboard';
    // Navigate to the list page (detail routes don't exist yet for most entity types)
    this.router.navigate([baseRoute]);
  }
}
