import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { WorkflowService } from '../../../../core/services/workflow.service';
import { Workflow } from '../../../../core/models/workflow.model';
import { WorkflowFormComponent } from '../workflow-form/workflow-form.component';

@Component({
  selector: 'app-workflow-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.css']
})
export class WorkflowListComponent implements OnInit {
  workflows: Workflow[] = [];
  displayedColumns = ['name', 'stages', 'actions'];

  constructor(
    private workflowService: WorkflowService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.workflowService.getAllWorkflows().subscribe(wfs => this.workflows = wfs);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(WorkflowFormComponent, {
      width: '600px',
      data: {},
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadWorkflows();
    });
  }

  openEditDialog(workflow: Workflow): void {
    const dialogRef = this.dialog.open(WorkflowFormComponent, {
      width: '600px',
      data: { workflow },
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadWorkflows();
    });
  }

  deleteWorkflow(workflow: Workflow): void {
    if (confirm(`Delete workflow "${workflow.name}"?`)) {
      this.workflowService.deleteWorkflow(workflow.id).subscribe(() => {
        this.loadWorkflows();
      });
    }
  }
}
