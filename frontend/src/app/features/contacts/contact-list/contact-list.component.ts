import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../../core/services/contact.service';
import { Contact } from '../../../core/models/contact.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatDialogModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Contacts</h2>
           <p class="text-slate-500">Manage customers and vendors.</p>
        </div>
        <app-button icon="add" (onClick)="openCreateModal()">New Contact</app-button>
      </div>

      <div class="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr *ngFor="let contact of contacts">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ contact.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                 <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                   {{ contact.type }}
                 </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ contact.email || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ contact.phone || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span [class]="contact.active ? 'text-green-600' : 'text-red-500'">
                  {{ contact.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-900" (click)="openCreateModal(contact)">Edit</button>
              </td>
            </tr>
            <tr *ngIf="contacts.length === 0">
               <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                  No contacts found.
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.contactService.getContacts().subscribe({
        next: (res: {data: { content: Contact[] }}) => this.contacts = res.data.content,
        error: (err: any) => console.error(err)
    });
  }

  openCreateModal(contact?: Contact) {
    const dialogRef = this.dialog.open(ContactFormComponent, {
      width: '800px',
      data: contact || null,
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (contact && contact.id) {
            this.contactService.updateContact(contact.id, result).subscribe(() => this.loadContacts());
        } else {
            this.contactService.createContact(result).subscribe(() => this.loadContacts());
        }
      }
    });
  }
}
