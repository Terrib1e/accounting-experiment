import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { OrganizationSettings } from '../../../core/models/settings.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-organization-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="space-y-6">
      <div>
         <h2 class="text-2xl font-bold text-slate-900">Organization Settings</h2>
         <p class="text-slate-500">Manage your company details.</p>
      </div>

      <div class="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
         <form (ngSubmit)="save()" #form="ngForm" class="space-y-6 max-w-2xl">
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <!-- Org Name -->
                <div class="sm:col-span-4">
                    <label class="block text-sm font-medium text-slate-700">Organization Name</label>
                    <div class="mt-1">
                        <input type="text" name="orgName" [(ngModel)]="settings.organizationName" required
                               class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border">
                    </div>
                </div>

                <!-- Tax ID -->
                <div class="sm:col-span-3">
                    <label class="block text-sm font-medium text-slate-700">Tax ID / EIN</label>
                    <div class="mt-1">
                        <input type="text" name="taxId" [(ngModel)]="settings.taxId"
                               class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border">
                    </div>
                </div>

                <!-- Currency -->
                <div class="sm:col-span-3">
                    <label class="block text-sm font-medium text-slate-700">Base Currency</label>
                    <div class="mt-1">
                        <select name="currency" [(ngModel)]="settings.baseCurrency"
                                class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border bg-white">
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                    </div>
                </div>

                <!-- Email -->
                <div class="sm:col-span-4">
                    <label class="block text-sm font-medium text-slate-700">Email Address</label>
                    <div class="mt-1">
                        <input type="email" name="email" [(ngModel)]="settings.email"
                               class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border">
                    </div>
                </div>

                <!-- Phone -->
                <div class="sm:col-span-4">
                    <label class="block text-sm font-medium text-slate-700">Phone</label>
                    <div class="mt-1">
                        <input type="tel" name="phone" [(ngModel)]="settings.phone"
                               class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border">
                    </div>
                </div>

                <!-- Address -->
                <div class="sm:col-span-6">
                    <label class="block text-sm font-medium text-slate-700">Address</label>
                    <div class="mt-1">
                        <textarea name="address" rows="3" [(ngModel)]="settings.address"
                                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border"></textarea>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <app-button type="submit" [loading]="saving">Save Changes</app-button>
            </div>
         </form>
      </div>
    </div>
  `
})
export class OrganizationSettingsComponent implements OnInit {
  settings: OrganizationSettings = {
      id: '',
      organizationName: '',
      baseCurrency: 'USD'
  };
  saving = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getOrganizationSettings().subscribe({
        next: (res: {data: OrganizationSettings}) => {
            if (res.data) this.settings = res.data;
        },
        error: (err: any) => console.error(err)
    });
  }

  save() {
      this.saving = true;
      this.settingsService.updateOrganizationSettings(this.settings).subscribe({
          next: (res: {data: OrganizationSettings}) => {
              this.settings = res.data;
              this.saving = false;
              alert('Settings saved successfully');
          },
          error: (err: any) => {
              console.error(err);
              this.saving = false;
          }
      });
  }
}
