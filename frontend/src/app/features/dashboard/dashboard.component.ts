import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { RouterLink, Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardStats } from './dashboard.model';
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
            <a routerLink="/invoices"
               class="group relative flex items-center p-5 premium-card border-none bg-gradient-to-br from-primary-600 to-indigo-700 overflow-hidden shadow-primary-glow hover:shadow-primary-500/40 transform hover:-translate-y-1 transition-all duration-300">
              <div class="absolute -right-6 -top-6 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <span class="material-icons !text-9xl">receipt</span>
              </div>
              <div class="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mr-5 backdrop-blur-md shadow-inner border border-white/10 group-hover:bg-white/30 transition-colors">
                <span class="material-icons text-white text-3xl">add</span>
              </div>
              <div class="relative z-10">
                <span class="text-lg font-bold text-white tracking-wide block">New Invoice</span>
                <p class="text-indigo-100 text-xs font-medium mt-0.5">Create & send to client</p>
              </div>
            </a>

            <a routerLink="/expenses"
               class="group relative flex items-center p-5 premium-card border-none bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div class="absolute -right-6 -top-6 text-white/5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <span class="material-icons !text-9xl">payments</span>
              </div>
              <div class="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mr-5 backdrop-blur-md shadow-inner border border-white/5 group-hover:bg-white/20 transition-colors">
                <span class="material-icons text-white text-3xl">upload</span>
              </div>
              <div class="relative z-10">
                <span class="text-lg font-bold text-white tracking-wide block">Record Expense</span>
                <p class="text-slate-400 text-xs font-medium mt-0.5">Upload receipt & categorize</p>
              </div>
            </a>

            <div class="grid grid-cols-2 gap-4">
                <a routerLink="/journals" class="premium-card p-5 group flex flex-col items-center justify-center h-40 hover:border-primary-400 cursor-pointer bg-white">
                  <div class="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary-50 group-hover:scale-110 transition-all duration-300">
                    <span class="material-icons text-slate-400 group-hover:text-primary-600 text-2xl">edit_note</span>
                  </div>
                  <span class="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary-600 transition-colors">Journal</span>
                </a>
                <a routerLink="/contacts" class="premium-card p-5 group flex flex-col items-center justify-center h-40 hover:border-primary-400 cursor-pointer bg-white">
                  <div class="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary-50 group-hover:scale-110 transition-all duration-300">
                    <span class="material-icons text-slate-400 group-hover:text-primary-600 text-2xl">group_add</span>
                  </div>
                  <span class="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary-600 transition-colors">Client</span>
                </a>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="lg:col-span-2 flex flex-col space-y-6">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Timeline</h3>
            <button routerLink="/journals" class="text-[10px] font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors flex items-center hover:underline">
               View General Ledger <span class="material-icons text-[10px] ml-1">arrow_forward</span>
            </button>
          </div>

          <div class="premium-card divide-y divide-slate-50 overflow-hidden bg-white" *ngIf="stats$ | async as stats; else loadingActivity">
            <div *ngFor="let item of stats.data.recentActivity" class="flex items-center p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <!-- Dynamic Icon Background -->
              <div [class]="'h-12 w-12 rounded-2xl flex items-center justify-center mr-5 border flex-shrink-0 group-hover:scale-105 transition-transform ' + getIconBgClass(item.type)">
                <span [class]="'material-icons ' + item.colorClass">{{ item.icon }}</span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{{ item.title }}</p>
                  <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">{{ item.date | date:'shortTime' }}</span>
                </div>
                <p class="text-xs text-slate-500 font-medium truncate flex items-center">
                   <span class="font-semibold text-slate-700 mr-1">{{ item.subtitle }}</span>
                   <span class="mx-1.5 h-1 w-1 rounded-full bg-slate-300" *ngIf="item.amount"></span>
                   <span class="font-mono text-slate-700 text-[11px]" *ngIf="item.amount">{{ item.amount | currency }}</span>
                </p>
              </div>
            </div>

            <div *ngIf="stats.data.recentActivity.length === 0" class="p-8 text-center text-slate-400 text-sm">
                No recent activity found.
            </div>
          </div>

          <ng-template #loadingActivity>
              <div class="premium-card p-6 space-y-4">
                  <div class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
                  <div class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
                  <div class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
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
}
