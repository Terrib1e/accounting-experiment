import { Component, ElementRef, ViewChild, HostListener, OnInit, OnDestroy, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services
import { InvoiceService } from '../../services/invoice.service';
import { ExpenseService } from '../../services/expense.service';
import { ContactService } from '../../services/contact.service';
import { JournalEntryService } from '../../services/journal-entry.service';
import { NotificationService } from '../../services/notification.service';

// Models
import { Notification } from '../../models/notification.model';

// Forms
import { InvoiceFormComponent } from '../../../features/invoices/invoice-form/invoice-form.component';
import { ExpenseFormComponent } from '../../../features/expenses/expense-form/expense-form.component';
import { ContactFormComponent } from '../../../features/contacts/contact-form/contact-form.component';
import { JournalEntryFormComponent } from '../../../features/journals/journal-entry-form/journal-entry-form.component';

interface SearchResult {
  icon: string;
  title: string;
  subtitle: string;
  route?: string;
  action?: () => void;
  category: 'Pages' | 'Actions' | 'Recent';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <header class="h-20 flex items-center justify-between px-8 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
      <!-- Left: Page Title & Breadcrumb -->
      <div class="flex flex-col justify-center animate-fade-in">
        <div class="flex items-center space-x-2 mb-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform</span>
          <span class="text-[10px] font-medium text-slate-300">/</span>
          <span class="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{{ pageTitle }}</span>
        </div>
        <h1 class="text-xl font-bold text-slate-900 leading-tight tracking-tight">{{ pageTitle }}</h1>
      </div>

      <!-- Center: Search Bar -->
      <div class="flex-1 max-w-xl mx-12 relative z-50">
        <div class="relative group">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">search</span>
          <input #searchInput
                 type="text"
                 [formControl]="searchControl"
                 (focus)="showResults = true"
                 (blur)="onBlur()"
                 placeholder="Search ledger, entities, or references..."
                 class="w-full pl-12 pr-16 py-2.5 bg-slate-100/50 border border-slate-200/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 font-medium
                        focus:outline-none focus:bg-white focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 focus:shadow-lg focus:shadow-primary-500/5
                        hover:bg-white hover:shadow-sm hover:border-slate-300/50 transition-all duration-300">
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-50 group-hover:opacity-100 transition-opacity">
             <kbd class="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm">⌘K</kbd>
          </div>
        </div>

        <!-- Search Popover -->
        <div *ngIf="showResults && filteredResults.length > 0"
             class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden ring-1 ring-black/5 animate-fade-in transform origin-top">
            <div class="max-h-[60vh] overflow-y-auto py-2">
                <div *ngFor="let category of ['Pages', 'Actions', 'Recent']">
                    <div *ngIf="getResultsByCategory(category).length > 0">
                        <h3 class="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{category}}</h3>
                        <div *ngFor="let result of getResultsByCategory(category)"
                             (mousedown)="selectResult(result)"
                             class="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group">
                            <div class="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <span class="material-icons text-sm">{{ result.icon }}</span>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{{ result.title }}</p>
                                <p class="text-[11px] text-slate-400">{{ result.subtitle }}</p>
                            </div>
                            <span class="material-icons text-slate-300 text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Select to navigate</span>
                <span class="flex items-center gap-1"><kbd class="font-bold">esc</kbd> to close</span>
            </div>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center space-x-3">
        <!-- New Transaction -->
        <button [matMenuTriggerFor]="createMenu"
                class="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 active:scale-95 mr-4">
           <span class="material-icons text-sm">add</span>
           <span class="text-xs font-bold uppercase tracking-widest">Create</span>
        </button>

        <mat-menu #createMenu="matMenu" class="premium-menu">
          <div class="px-4 py-2 border-b border-slate-100 mb-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Create</span>
          </div>
          <button mat-menu-item (click)="quickCreate('invoice')" class="flex items-center">
            <mat-icon class="text-primary-500">description</mat-icon>
            <span class="text-sm font-medium">New Invoice</span>
          </button>
          <button mat-menu-item (click)="quickCreate('expense')" class="flex items-center">
            <mat-icon class="text-accent-500">payments</mat-icon>
            <span class="text-sm font-medium">New Expense</span>
          </button>
          <button mat-menu-item (click)="quickCreate('journal')" class="flex items-center">
            <mat-icon class="text-indigo-500">receipt_long</mat-icon>
            <span class="text-sm font-medium">New Journal Entry</span>
          </button>
          <button mat-menu-item (click)="quickCreate('contact')" class="flex items-center">
            <mat-icon class="text-slate-500">person_add</mat-icon>
            <span class="text-sm font-medium">New Contact</span>
          </button>
        </mat-menu>

        <div class="h-8 w-px bg-slate-200/60 mx-2"></div>

        <!-- Notifications -->
        <button [matMenuTriggerFor]="notificationMenu"
                (menuOpened)="loadNotifications()"
                class="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all relative group">
          <span class="material-icons text-xl group-hover:swing">notifications_none</span>
          <span *ngIf="unreadCountSig() > 0" class="absolute top-2 right-2 h-4 w-4 rounded-full bg-red-500 border-2 border-white shadow-sm text-[9px] text-white font-bold flex items-center justify-center">
            {{ unreadCountSig() > 9 ? '9+' : unreadCountSig() }}
          </span>
        </button>

        <mat-menu #notificationMenu="matMenu" class="premium-menu">
          <div class="px-4 py-3 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notifications</span>
              <span *ngIf="unreadCountSig() > 0"
                    (click)="markAllAsRead($event)"
                    class="text-[10px] font-bold text-primary-600 cursor-pointer hover:underline">Mark all as read</span>
            </div>
          </div>
          <div class="max-h-80 overflow-y-auto min-w-[320px]">
            <!-- Loading State -->
            <div *ngIf="loadingNotifications" class="p-4 text-center text-slate-400">
              <span class="material-icons animate-spin text-lg">sync</span>
              <p class="text-xs mt-1">Loading...</p>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loadingNotifications && notifications.length === 0" class="p-6 text-center">
              <span class="material-icons text-3xl text-slate-300">notifications_off</span>
              <p class="text-xs text-slate-400 mt-2">No notifications yet</p>
            </div>

            <!-- Notifications List -->
            <div *ngFor="let notification of notifications"
                 class="p-4 flex items-start space-x-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 group"
                 [class.opacity-60]="notification.read"
                 (click)="handleNotificationClick(notification, $event)">
              <div class="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                   [ngClass]="getNotificationIconClass(notification.type)">
                <mat-icon class="text-sm">{{ getNotificationIcon(notification.category) }}</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-900 block truncate">{{ notification.title }}</span>
                <span class="text-[11px] text-slate-500 block truncate">{{ notification.message }}</span>
                <span class="text-[10px] text-slate-400 mt-1 block">{{ getTimeAgo(notification.createdAt) }}</span>
              </div>
              <!-- Delete button removed -->
            </div>
          </div>
          <div class="p-2 text-center border-t border-slate-100">
            <button (click)="viewAllNotifications()" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary-600 transition-colors">View All Notifications</button>
          </div>
        </mat-menu>

        <!-- Help -->
        <button [matMenuTriggerFor]="helpMenu"
                class="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
          <span class="material-icons text-xl">help_outline</span>
        </button>

        <mat-menu #helpMenu="matMenu" class="premium-menu">
          <div class="px-4 py-2 border-b border-slate-100 mb-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support & Resources</span>
          </div>
          <button mat-menu-item (click)="openHelp('docs')" class="flex items-center">
            <mat-icon class="text-slate-500">menu_book</mat-icon>
            <span class="text-sm font-medium">Documentation</span>
          </button>
          <button mat-menu-item (click)="openHelp('contact')" class="flex items-center">
            <mat-icon class="text-slate-500">support_agent</mat-icon>
            <span class="text-sm font-medium">Contact Support</span>
          </button>
          <button mat-menu-item (click)="openHelp('shortcuts')" class="flex items-center">
            <mat-icon class="text-slate-500">keyboard</mat-icon>
            <span class="text-sm font-medium">Keyboard Shortcuts</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    @keyframes swing {
      20% { transform: rotate(15deg); }
      40% { transform: rotate(-10deg); }
      60% { transform: rotate(5deg); }
      80% { transform: rotate(-5deg); }
      100% { transform: rotate(0deg); }
    }
    .group-hover\\:swing:hover {
      animation: swing 0.5s ease-in-out;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageTitle = 'Dashboard';
  searchControl = new FormControl('');
  showResults = false;

  // Notifications
  notifications: Notification[] = [];
  loadingNotifications = false;

  // Expose signal to template
  readonly unreadCountSig: Signal<number>;

  private destroy$ = new Subject<void>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  // Mock Data
  allResults: SearchResult[] = [
      { icon: 'dashboard', title: 'Dashboard', subtitle: 'Go to main overview', route: '/dashboard', category: 'Pages' },
      { icon: 'receipt_long', title: 'Journal Entries', subtitle: 'View general ledger', route: '/journals', category: 'Pages' },
      { icon: 'description', title: 'Invoices', subtitle: 'Manage client invoices', route: '/invoices', category: 'Pages' },
      { icon: 'payments', title: 'Expenses', subtitle: 'Track company spending', route: '/expenses', category: 'Pages' },

      { icon: 'add_circle', title: 'New Invoice', subtitle: 'Create a customer bill', route: '/invoices/new', category: 'Actions' },
      { icon: 'note_add', title: 'New Journal Entry', subtitle: 'Record manual manual entry', route: '/journals/new', category: 'Actions' },

      { icon: 'history', title: 'INV-2024-001', subtitle: 'Acme Corp ($4,500)', route: '/invoices/1', category: 'Recent' },
      { icon: 'history', title: 'Expense #1023', subtitle: 'Office Supplies', route: '/expenses/1', category: 'Recent' },
  ];

  filteredResults: SearchResult[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private invoiceService: InvoiceService,
    private expenseService: ExpenseService,
    private contactService: ContactService,
    private journalEntryService: JournalEntryService,
    public notificationService: NotificationService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });

    this.filteredResults = this.allResults;

    this.searchControl.valueChanges.subscribe(val => {
        this.filterResults(val || '');
    });

    this.unreadCountSig = this.notificationService.unreadCount;
  }

  ngOnInit(): void {
    // Initial fetch of unread count
    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown.control.k', ['$event'])
  @HostListener('window:keydown.meta.k', ['$event'])
  handleKeyboardEvent(event: Event) {
    event.preventDefault();
    this.searchInput.nativeElement.focus();
  }

  @HostListener('window:keydown.escape', ['$event'])
  handleEscape(event: Event) {
    this.showResults = false;
    this.searchInput.nativeElement.blur();
  }

  filterResults(query: string) {
      if (!query) {
          this.filteredResults = this.allResults;
          return;
      }
      const lowerQuery = query.toLowerCase();
      this.filteredResults = this.allResults.filter(item =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.subtitle.toLowerCase().includes(lowerQuery)
      );
  }

  getResultsByCategory(category: string): SearchResult[] {
      return this.filteredResults.filter(r => r.category === category);
  }

  selectResult(result: SearchResult) {
      if (result.route) {
          this.router.navigate([result.route]);
      } else if (result.action) {
          result.action();
      }
      this.showResults = false;
      this.searchControl.setValue('');
  }

  onBlur() {
      // Delay to allow click event to register
      setTimeout(() => {
          this.showResults = false;
      }, 200);
  }

  // Notification Methods
  loadNotifications(): void {
    this.loadingNotifications = true;
    // Load unread notifications first, or recent ones
    this.notificationService.getAllNotifications(0, 10).subscribe({
      next: (res) => {
        this.notifications = res.data.content;
        this.loadingNotifications = false;
      },
      error: () => {
        this.loadingNotifications = false;
      }
    });
  }

  handleNotificationClick(notification: Notification, event: Event): void {
    event.stopPropagation();

    // Mark as read if unread
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
      });
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.read = true);
    });
  }

  // Delete not implemented in MVP
  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    // No-op or TODO: Implement delete endpoint
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
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

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  quickCreate(type: 'invoice' | 'expense' | 'journal' | 'contact') {
    switch (type) {
      case 'invoice':
        this.dialog.open(InvoiceFormComponent, {
          width: '900px',
          disableClose: true,
          panelClass: 'premium-dialog'
        }).afterClosed().subscribe(result => {
          if (result) this.invoiceService.createInvoice(result).subscribe();
        });
        break;
      case 'expense':
        this.dialog.open(ExpenseFormComponent, {
          width: '900px',
          disableClose: true,
          panelClass: 'premium-dialog'
        }).afterClosed().subscribe(result => {
          if (result) this.expenseService.createExpense(result).subscribe();
        });
        break;
      case 'journal':
        this.dialog.open(JournalEntryFormComponent, {
          width: '1000px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: true,
          panelClass: 'premium-dialog'
        }).afterClosed().subscribe(result => {
          if (result) this.journalEntryService.createEntry(result).subscribe();
        });
        break;
      case 'contact':
        this.dialog.open(ContactFormComponent, {
          width: '800px',
          panelClass: 'premium-dialog'
        }).afterClosed().subscribe(result => {
          if (result) this.contactService.createContact(result).subscribe();
        });
        break;
    }
  }

  openHelp(type: 'docs' | 'contact' | 'shortcuts') {
    // Implement help actions
    console.log(`Opening help: ${type}`);
    if (type === 'shortcuts') {
      // Toggle search focus as a demonstration of a shortcut
      this.searchInput.nativeElement.focus();
    }
  }

  private updatePageTitle(url: string) {
    const titleMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/accounts': 'Chart of Accounts',
      '/journals': 'Journal Entries',
      '/contacts': 'Contacts',
      '/invoices': 'Invoices',
      '/expenses': 'Expenses',
      '/banking': 'Bank Accounts',
      '/reports': 'Financial Reports',
      '/workflow': 'Workflow Board',
      '/jobs': 'All Jobs',
      '/settings/organization': 'Organization Settings',
      '/settings/fiscal-periods': 'Fiscal Periods',
    };

    for (const [path, title] of Object.entries(titleMap)) {
      if (url.startsWith(path)) {
        this.pageTitle = title;
        return;
      }
    }
    this.pageTitle = 'Dashboard';
  }
}
