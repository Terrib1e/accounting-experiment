import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-primary-50/30 flex flex-col">
      <!-- Premium Header -->
      <header class="glass-panel border-b border-slate-200/60 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo & Brand -->
            <div class="flex items-center space-x-4">
              <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all">
                <span class="material-icons text-white text-xl">account_balance</span>
              </div>
              <div class="hidden sm:block">
                <h1 class="text-lg font-bold text-slate-900 tracking-tight">Client Portal</h1>
                <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Secure Access</p>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="hidden md:flex items-center space-x-1">
              <a routerLink="/portal" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact: true}"
                 class="nav-link">
                <span class="material-icons text-lg">dashboard</span>
                <span>Dashboard</span>
              </a>
              <a routerLink="/portal/invoices" routerLinkActive="nav-active"
                 class="nav-link">
                <span class="material-icons text-lg">receipt_long</span>
                <span>Invoices</span>
              </a>
              <a routerLink="/portal/jobs" routerLinkActive="nav-active"
                 class="nav-link">
                <span class="material-icons text-lg">work_outline</span>
                <span>My Work</span>
              </a>
            </nav>

            <!-- User Menu -->
            <div class="flex items-center space-x-3">
              <!-- Time Display -->
              <div class="hidden lg:flex flex-col items-end border-r border-slate-200 pr-4 mr-1">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ currentTime }}</span>
                <span class="text-xs font-semibold text-slate-600">{{ currentDate }}</span>
              </div>

              <!-- Help -->
              <button class="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors group">
                <span class="material-icons text-slate-500 group-hover:text-primary-600 text-lg transition-colors">help_outline</span>
              </button>

              <!-- Notifications -->
              <button class="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors relative group">
                <span class="material-icons text-slate-500 group-hover:text-primary-600 text-lg transition-colors">notifications_none</span>
                <span class="absolute -top-0.5 -right-0.5 h-3 w-3 bg-accent-500 rounded-full border-2 border-white"></span>
              </button>

              <!-- User Avatar Dropdown -->
              <div class="relative">
                <button (click)="toggleUserMenu()" class="flex items-center space-x-2 h-10 pl-2 pr-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                  <div class="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span class="text-white text-xs font-bold">{{ userInitials }}</span>
                  </div>
                  <span class="material-icons text-slate-400 text-sm">expand_more</span>
                </button>

                <!-- Dropdown Menu -->
                <div *ngIf="userMenuOpen" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200/60 py-2 animate-scale-in origin-top-right z-50">
                  <div class="px-4 py-3 border-b border-slate-100">
                    <p class="text-sm font-semibold text-slate-900">{{ userName }}</p>
                    <p class="text-xs text-slate-500">{{ userEmail }}</p>
                  </div>
                  <a routerLink="/portal" class="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">
                    <span class="material-icons text-lg mr-3">settings</span>
                    Account Settings
                  </a>
                  <button (click)="logout()" class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <span class="material-icons text-lg mr-3">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Nav -->
        <div class="md:hidden border-t border-slate-200/60">
          <div class="flex justify-around py-2">
            <a routerLink="/portal" routerLinkActive="text-primary-600" [routerLinkActiveOptions]="{exact: true}"
               class="flex flex-col items-center p-2 text-slate-500 hover:text-primary-600 transition-colors">
              <span class="material-icons text-xl">dashboard</span>
              <span class="text-[10px] font-semibold mt-0.5">Dashboard</span>
            </a>
            <a routerLink="/portal/invoices" routerLinkActive="text-primary-600"
               class="flex flex-col items-center p-2 text-slate-500 hover:text-primary-600 transition-colors">
              <span class="material-icons text-xl">receipt_long</span>
              <span class="text-[10px] font-semibold mt-0.5">Invoices</span>
            </a>
            <a routerLink="/portal/jobs" routerLinkActive="text-primary-600"
               class="flex flex-col items-center p-2 text-slate-500 hover:text-primary-600 transition-colors">
              <span class="material-icons text-xl">work_outline</span>
              <span class="text-[10px] font-semibold mt-0.5">My Work</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-slate-900 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div class="flex items-center space-x-2">
              <div class="h-6 w-6 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span class="material-icons text-white text-sm">account_balance</span>
              </div>
              <span class="text-sm font-semibold text-slate-400">FinanceHub Portal</span>
            </div>
            <div class="flex items-center space-x-6 text-xs">
              <a href="#" class="text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" class="text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" class="text-slate-500 hover:text-slate-300 transition-colors">Contact Support</a>
            </div>
            <div class="text-xs text-slate-600">
              © 2026 All rights reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .nav-link {
      @apply flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200;
    }
    .nav-active {
      @apply text-primary-700 bg-primary-100/60 shadow-sm;
    }
  `]
})
export class PortalLayoutComponent implements OnInit, OnDestroy {
  userMenuOpen = false;
  currentTime = '';
  currentDate = '';
  userName = 'Client User';
  userEmail = 'client@acme.com';
  userInitials = 'CU';
  private timeInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 60000);

    // Get user info from auth service
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.name;
      this.userEmail = user.email;
      this.userInitials = user.name.charAt(0);
    }
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    this.currentDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
