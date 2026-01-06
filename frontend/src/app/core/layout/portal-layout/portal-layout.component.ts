import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 class="text-xl font-semibold text-gray-800">Client Portal</h1>
          <div class="flex items-center gap-4">
            <a routerLink="/portal" routerLinkActive="text-blue-600" [routerLinkActiveOptions]="{exact: true}"
               class="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a routerLink="/portal/invoices" routerLinkActive="text-blue-600"
               class="text-gray-600 hover:text-gray-900">My Invoices</a>
            <a routerLink="/portal/jobs" routerLinkActive="text-blue-600"
               class="text-gray-600 hover:text-gray-900">My Work</a>
            <button class="text-gray-500 hover:text-gray-700">
              <span class="material-icons">logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class PortalLayoutComponent {}
