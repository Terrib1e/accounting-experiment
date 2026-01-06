import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
}

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-800">My Invoices</h2>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table mat-table [dataSource]="invoices" class="w-full">

          <ng-container matColumnDef="invoiceNumber">
            <th mat-header-cell *matHeaderCellDef>Invoice #</th>
            <td mat-cell *matCellDef="let inv" class="font-medium text-blue-600">{{inv.invoiceNumber}}</td>
          </ng-container>

          <ng-container matColumnDef="issueDate">
            <th mat-header-cell *matHeaderCellDef>Issue Date</th>
            <td mat-cell *matCellDef="let inv">{{inv.issueDate | date}}</td>
          </ng-container>

          <ng-container matColumnDef="dueDate">
            <th mat-header-cell *matHeaderCellDef>Due Date</th>
            <td mat-cell *matCellDef="let inv">{{inv.dueDate | date}}</td>
          </ng-container>

          <ng-container matColumnDef="totalAmount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let inv">{{inv.totalAmount | currency}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let inv">
              <span class="px-2 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': inv.status === 'DRAFT',
                      'bg-blue-100 text-blue-800': inv.status === 'SENT',
                      'bg-green-100 text-green-800': inv.status === 'PAID',
                      'bg-red-100 text-red-800': inv.status === 'VOID'
                    }">
                {{inv.status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let inv">
              <button mat-button color="primary">View</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class ClientInvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  displayedColumns = ['invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Invoice[]>(`${environment.apiUrl}/portal/invoices`).subscribe({
      next: (data) => this.invoices = data,
      error: (err) => console.error('Failed to load invoices', err)
    });
  }
}
