import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseListComponent } from './expense-list.component';
import { ExpenseService } from '../../../core/services/expense.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Expense } from '../../../core/models/expense.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

describe('ExpenseListComponent', () => {
  let component: ExpenseListComponent;
  let fixture: ComponentFixture<ExpenseListComponent>;
  let expenseServiceMock: jasmine.SpyObj<ExpenseService>;
  let matDialogMock: jasmine.SpyObj<MatDialog>;

  const mockExpenses: Expense[] = [
    {
      id: '1',
      date: '2023-01-01T00:00:00.000Z',
      vendor: { id: 'v1', name: 'Vendor 1' },
      referenceNumber: 'REF001',
      totalAmount: 100,
      currency: 'USD',
      status: 'DRAFT',
      lines: []
    }
  ];

  beforeEach(async () => {
    expenseServiceMock = jasmine.createSpyObj('ExpenseService', ['getExpenses', 'deleteExpense', 'updateExpense', 'createExpense', 'approveExpense', 'payExpense']);
    matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    expenseServiceMock.getExpenses.and.returnValue(of({ data: { content: mockExpenses } }));

    await TestBed.configureTestingModule({
      imports: [
        ExpenseListComponent,
        CommonModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ExpenseService, useValue: expenseServiceMock },
        { provide: MatDialog, useValue: matDialogMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load expenses on init', () => {
    expect(expenseServiceMock.getExpenses).toHaveBeenCalled();
    expect(component.expenses).toBe(mockExpenses);
    expect(component.expenses.length).toBe(1);
    expect(component.expenses[0].referenceNumber).toBe('REF001');
  });

  it('should open create modal', () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));
    matDialogMock.open.and.returnValue(dialogRefSpy);

    component.openCreateModal();

    expect(matDialogMock.open).toHaveBeenCalled();
  });
});
