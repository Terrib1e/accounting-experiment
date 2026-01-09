import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ButtonComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Notifications</h2>
          <p class="text-slate-500 mt-1">View and manage all your notifications.</p>
        </div>
        <div class="flex items-center gap-3">
            <app-button variant="secondary" (onClick)="markAllAsRead()" icon="done_all">Mark all as read</app-button>
        </div>
      </div>

      <!-- Notification List -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-900">Recent Activity</h3>

            <div class="flex items-center gap-2">
                <button (click)="filter = 'all'"
                        [class]="filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'"
                        class="px-3 py-1 rounded-full text-xs font-semibold transition-colors">
                    All
                </button>
                <button (click)="filter = 'unread'"
                        [class]="filter === 'unread' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-700'"
                        class="px-3 py-1 rounded-full text-xs font-semibold transition-colors">
                    Unread
                </button>
            </div>
        </div>

        <div *ngIf="loading" class="p-12 text-center text-slate-400">
             <span class="material-icons animate-spin text-3xl mb-2">sync</span>
             <p>Loading notifications...</p>
        </div>

        <div *ngIf="!loading && notifications.length === 0" class="p-16 text-center">
            <div class="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-icons text-3xl text-slate-300">notifications_off</span>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">No notifications</h3>
            <p class="text-slate-500 mt-1">You're all caught up!</p>
        </div>

        <div *ngIf="!loading && notifications.length > 0">
            <div *ngFor="let notification of filteredNotifications"
                 class="group p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-4"
                 [class.bg-blue-50]="!notification.read"
                 (click)="handleNotificationClick(notification)">

                <div class="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                     [ngClass]="getNotificationIconClass(notification.type)">
                    <mat-icon>{{ getNotificationIcon(notification.category) }}</mat-icon>
                </div>

                <div class="flex-1 pt-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-semibold text-slate-900 mb-0.5" [class.text-primary-700]="!notification.read">{{ notification.title }}</p>
                            <p class="text-sm text-slate-600 leading-relaxed">{{ notification.message }}</p>
                            <div class="flex items-center gap-3 mt-2">
                                <span class="text-xs text-slate-400">{{ notification.createdAt | date:'medium' }}</span>
                                <span class="text-xs font-semibold text-slate-300 px-2 py-0.5 rounded-full bg-slate-100 uppercase tracking-widest">{{ notification.category }}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span *ngIf="!notification.read" class="h-2 w-2 rounded-full bg-primary-500"></span>
                            <span *ngIf="notification.actionUrl" class="material-icons text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all text-sm">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  filter: 'all' | 'unread' = 'all';

  constructor(
      private notificationService: NotificationService,
      private router: Router
  ) {}

  ngOnInit() {
      this.loadNotifications();
  }

  loadNotifications() {
      this.loading = true;
      this.notificationService.getAllNotifications(0, 50).subscribe({
          next: (res) => {
              this.notifications = res.data.content;
              this.loading = false;
          },
          error: (err) => {
              console.error('Error loading notifications', err);
              this.loading = false;
          }
      });
  }

  get filteredNotifications() {
      if (this.filter === 'unread') {
          return this.notifications.filter(n => !n.read);
      }
      return this.notifications;
  }

  markAllAsRead() {
      this.notificationService.markAllAsRead().subscribe(() => {
          this.notifications.forEach(n => n.read = true);
      });
  }

  handleNotificationClick(notification: Notification) {
      if (!notification.read) {
          this.notificationService.markAsRead(notification.id).subscribe(() => {
              notification.read = true;
          });
      }

      if (notification.actionUrl) {
          this.router.navigate([notification.actionUrl]);
      }
  }

  getNotificationIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'SYSTEM': 'settings',
      'INVOICE': 'description',
      'EXPENSE': 'payments',
      'PAYMENT': 'account_balance',
      'JOB': 'work',
      'APPROVAL': 'check_circle',
      'REMINDER': 'alarm'
    };
    return iconMap[category] || 'notifications';
  }

  getNotificationIconClass(type: string): string {
    const classMap: Record<string, string> = {
      'INFO': 'bg-blue-100 text-blue-600',
      'SUCCESS': 'bg-green-100 text-green-600',
      'WARNING': 'bg-amber-100 text-amber-600',
      'ERROR': 'bg-red-100 text-red-600'
    };
    return classMap[type] || 'bg-slate-100 text-slate-600';
  }
}
