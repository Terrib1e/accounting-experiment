import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="h-screen w-72 flex flex-col fixed left-0 top-0 z-20 glass-dark">

      <!-- Logo Section -->
      <div class="h-24 flex items-center px-8">
        <div class="flex items-center space-x-4">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-primary-glow animate-scale-in">
             <span class="material-icons text-white text-xl">account_balance</span>
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-bold tracking-tight text-white/90">AcctPlatform</span>
            <span class="text-[10px] text-primary-400 font-bold uppercase tracking-widest leading-none">Enterprise</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">

        <div class="nav-section-label">Main</div>
        <a routerLink="/dashboard" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">dashboard</span>
          </div>
          <span class="nav-text">Dashboard</span>
        </a>

        <a routerLink="/time-tracking" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">timer</span>
          </div>
          <span class="nav-text">Time Tracking</span>
        </a>

        <div class="nav-section-label">Accounting</div>
        <a routerLink="/accounts" routerLinkActive="nav-active"
           class="nav-item group">
           <div class="nav-icon-container">
            <span class="material-icons nav-icon">account_balance</span>
          </div>
          <span class="nav-text">Chart of Accounts</span>
        </a>

        <a routerLink="/journals" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">receipt_long</span>
          </div>
          <span class="nav-text">Journal Entries</span>
        </a>

        <div class="nav-section-label">Business</div>
        <a routerLink="/contacts" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">people</span>
          </div>
          <span class="nav-text">Contacts</span>
        </a>

        <a routerLink="/invoices" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">description</span>
          </div>
          <span class="nav-text">Invoices</span>
        </a>

        <a routerLink="/expenses" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">payments</span>
          </div>
          <span class="nav-text">Expenses</span>
        </a>

        <div class="nav-section-label">Reports</div>
        <a routerLink="/reports" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact: true}"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">assessment</span>
          </div>
          <span class="nav-text">Financial Reports</span>
        </a>

        <a routerLink="/reports/aging" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">schedule</span>
          </div>
          <span class="nav-text">Aging Reports</span>
        </a>

        <div class="nav-section-label">System</div>
        <a routerLink="/settings/organization" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">business</span>
          </div>
          <span class="nav-text">Organization</span>
        </a>

        <a routerLink="/workflow" routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-container">
            <span class="material-icons nav-icon">view_kanban</span>
          </div>
          <span class="nav-text">Workflow Board</span>
        </a>

      </nav>

      <!-- User Footer -->
      <div class="p-6 border-t border-white/5 bg-white/5 backdrop-blur-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="relative group cursor-pointer">
              <div class="absolute -inset-1 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div class="relative h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-white border border-white/10 ring-2 ring-white/5">
                {{ userInitials }}
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-white">{{ currentUser()?.name || 'User' }}</span>
              <span class="text-[10px] text-slate-400 font-medium">{{ currentUser()?.role || 'Member' }}</span>
            </div>
          </div>
          <button (click)="logout()"
                  class="p-2 rounded-xl glass-button text-slate-400 hover:text-white group relative overflow-hidden">
            <span class="material-icons text-lg group-hover:translate-x-1 transition-transform">logout</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .nav-item {
      @apply flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative;
      @apply text-slate-400 hover:bg-white/5 hover:text-white;
    }

    .nav-text {
      @apply text-sm font-semibold tracking-wide;
    }

    .nav-icon-container {
      @apply w-10 h-10 flex items-center justify-center rounded-lg mr-3;
      @apply transition-all duration-300;
      background: rgba(255, 255, 255, 0.03);
    }

    .nav-icon {
      @apply text-xl transition-all duration-300;
    }

    /* Active State */
    .nav-active {
      @apply text-white bg-primary-500/10;
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
      @apply border-r-2 border-primary-500;
    }

    .nav-active .nav-icon-container {
      @apply bg-primary-500 shadow-primary-glow text-white;
    }

    .nav-section-label {
      @apply pt-8 pb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500;
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
   `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  constructor() {}

  get userInitials(): string {
    const user = this.currentUser();
    if (!user) return '??';
    const parts = user.name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}
