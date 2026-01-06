import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PortalService, ClientDashboardDto } from '../../../core/services/portal.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Welcome back, {{ dashboard?.contactName }}</h2>
        <p class="text-gray-500">Here's an overview of your account.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <!-- Outstanding Invoices Card -->
        <mat-card class="hover:shadow-lg transition-shadow">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">Outstanding Invoices</p>
                <p class="text-3xl font-bold text-blue-600">{{ dashboard?.outstandingInvoices || 0 }}</p>
                <p class="text-sm text-gray-500 mt-1" *ngIf="dashboard?.totalOutstandingAmount">
                  {{ dashboard?.totalOutstandingAmount | currency }}
                </p>
              </div>
              <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <mat-icon class="text-blue-600">receipt</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Active Jobs Card -->
        <mat-card class="hover:shadow-lg transition-shadow">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">Active Jobs</p>
                <p class="text-3xl font-bold text-green-600">{{ dashboard?.activeJobs || 0 }}</p>
              </div>
              <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <mat-icon class="text-green-600">work</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Documents Pending Card -->
        <mat-card class="hover:shadow-lg transition-shadow">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">New Documents</p>
                <p class="text-3xl font-bold text-orange-600">{{ dashboard?.unreadDocuments || 0 }}</p>
              </div>
              <div class="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <mat-icon class="text-orange-600">file_present</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  dashboard: ClientDashboardDto | null = null;

  constructor(private portalService: PortalService) {}

  ngOnInit(): void {
    this.portalService.getDashboard().subscribe({
      next: (data: ClientDashboardDto) => this.dashboard = data,
      error: (err: any) => console.error('Failed to load dashboard', err)
    });
  }
}
