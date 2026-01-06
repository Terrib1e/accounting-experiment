import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // Create a module if needed, but for now importing standalone
import { NgIf, NgFor } from '@angular/common';

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
  imports: [CommonModule, ReactiveFormsModule],
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
        <button class="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 active:scale-95 mr-4">
           <span class="material-icons text-sm">add</span>
           <span class="text-xs font-bold uppercase tracking-widest">Create</span>
        </button>

        <div class="h-8 w-px bg-slate-200/60 mx-2"></div>

        <!-- Notifications -->
        <button class="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all relative group">
          <span class="material-icons text-xl group-hover:swing">notifications_none</span>
          <span class="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white shadow-sm animate-pulse"></span>
        </button>

        <!-- Help -->
        <button class="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
          <span class="material-icons text-xl">help_outline</span>
        </button>
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
export class HeaderComponent {
  pageTitle = 'Dashboard';
  searchControl = new FormControl('');
  showResults = false;

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

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });

    this.filteredResults = this.allResults;

    this.searchControl.valueChanges.subscribe(val => {
        this.filterResults(val || '');
    });
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
