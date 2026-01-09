import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/auth/auth.guard';
import { clientGuard } from './core/auth/client.guard';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'workflow',
        loadComponent: () =>
          import(
            './features/workflow/components/job-board/job-board.component'
          ).then((m) => m.JobBoardComponent),
      },
      {
        path: 'workflows',
        loadComponent: () =>
          import(
            './features/workflow/components/workflow-list/workflow-list.component'
          ).then((m) => m.WorkflowListComponent),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import(
            './features/workflow/components/job-list/job-list.component'
          ).then((m) => m.JobListComponent),
      },
      {
        path: 'jobs/:id',
        loadComponent: () =>
          import(
            './features/workflow/components/job-detail/job-detail.component'
          ).then((m) => m.JobDetailComponent),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import(
            './features/accounts/account-list/account-list.component'
          ).then((m) => m.AccountListComponent),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import(
            './features/contacts/contact-list/contact-list.component'
          ).then((m) => m.ContactListComponent),
      },
      {
        path: 'journals',
        loadComponent: () =>
          import(
            './features/journals/journal-list/journal-list.component'
          ).then((m) => m.JournalListComponent),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import(
            './features/invoices/invoice-list/invoice-list.component'
          ).then((m) => m.InvoiceListComponent),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import(
            './features/expenses/expense-list/expense-list.component'
          ).then((m) => m.ExpenseListComponent),
      },
      {
        path: 'banking',
        loadComponent: () =>
          import(
            './features/banking/bank-account-list/bank-account-list.component'
          ).then((m) => m.BankAccountListComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/report-view/report-view.component').then(
            (m) => m.ReportViewComponent
          ),
      },
      {
        path: 'reports/aging',
        loadComponent: () =>
          import(
            './features/reports/aging-report/aging-report.component'
          ).then((m) => m.AgingReportComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import(
            './features/notifications/notification-list/notification-list.component'
          ).then((m) => m.NotificationListComponent),
      },

      {
        path: 'settings/organization',
        loadComponent: () =>
          import(
            './features/settings/organization-settings/organization-settings.component'
          ).then((m) => m.OrganizationSettingsComponent),
      },
      {
        path: 'settings/fiscal-periods',
        loadComponent: () =>
          import(
            './features/settings/fiscal-periods/fiscal-periods.component'
          ).then((m) => m.FiscalPeriodComponent),
      },
      {
        path: 'settings/tax-rates',
        loadComponent: () =>
          import(
            './features/settings/tax-rates/tax-rate-list/tax-rate-list.component'
          ).then((m) => m.TaxRateListComponent),
      },
    ],
  },
  {
    path: 'portal',
    loadComponent: () =>
      import('./core/layout/portal-layout/portal-layout.component').then(
        (m) => m.PortalLayoutComponent
      ),
    canActivate: [clientGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/portal/dashboard/client-dashboard.component').then(
            (m) => m.ClientDashboardComponent
          ),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/portal/invoices/client-invoices.component').then(
            (m) => m.ClientInvoicesComponent
          ),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/portal/jobs/client-jobs.component').then(
            (m) => m.ClientJobsComponent
          ),
      },
    ],
  },
];
