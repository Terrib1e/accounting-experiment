import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkflowService } from '../../../../core/services/workflow.service';
import { JobService } from '../../../../core/services/job.service';
import { Workflow, WorkflowStage } from '../../../../core/models/workflow.model';
import { Job } from '../../../../core/models/job.model';
import { JobFormComponent } from '../job-form/job-form.component';

@Component({
  selector: 'app-job-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './job-board.component.html',
  styleUrls: ['./job-board.component.css']
})
export class JobBoardComponent implements OnInit {
  workflows: Workflow[] = [];
  selectedWorkflowId: string | null = null;
  currentWorkflow: Workflow | null = null;

  // Map stageId -> List of Jobs
  columns: { [stageId: string]: Job[] } = {};

  // Track connected drop lists for CDK
  connectedDropLists: string[] = [];

  constructor(
    private workflowService: WorkflowService,
    private jobService: JobService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.workflowService.getAllWorkflows().subscribe(workflows => {
      this.workflows = workflows;
      if (workflows.length > 0) {
        // Auto-select first workflow or restore from query param
        this.selectedWorkflowId = workflows[0].id; // TODO: Query param support
        this.onWorkflowChange(this.selectedWorkflowId);
      }
    });
  }

  onWorkflowChange(workflowId: string): void {
    this.selectedWorkflowId = workflowId;
    this.currentWorkflow = this.workflows.find(w => w.id === workflowId) || null;

    if (this.currentWorkflow) {
      // Sort stages by orderIndex
      this.currentWorkflow.stages.sort((a, b) => a.orderIndex - b.orderIndex);
      this.connectedDropLists = this.currentWorkflow.stages.map(s => s.id);

      // Initialize columns
      this.columns = {};
      this.currentWorkflow.stages.forEach(s => this.columns[s.id] = []);

      this.loadJobs(workflowId);
    }
  }

  loadJobs(workflowId: string): void {
    this.jobService.getJobsByWorkflow(workflowId).subscribe(jobs => {
      // Clear existing first
      if (this.currentWorkflow) {
        this.currentWorkflow.stages.forEach(s => this.columns[s.id] = []);
      }

      // Distribute jobs to columns
      jobs.forEach(job => {
        if (this.columns[job.currentStageId]) {
          this.columns[job.currentStageId].push(job);
        }
      });
    });
  }

  drop(event: CdkDragDrop<Job[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const previousContainerData = event.previousContainer.data;
      const containerData = event.container.data;
      const previousIndex = event.previousIndex;
      const currentIndex = event.currentIndex;

      transferArrayItem(
        previousContainerData,
        containerData,
        previousIndex,
        currentIndex,
      );

      const job = containerData[currentIndex];
      const newStageId = event.container.id;
      const oldStageId = event.previousContainer.id;

      this.updateJobStage(job, newStageId, oldStageId, previousContainerData, containerData, previousIndex, currentIndex);
    }
  }

  revertMove(
    previousContainerData: Job[],
    containerData: Job[],
    previousIndex: number,
    currentIndex: number,
    job: Job,
    oldStageId: string
  ): void {
    transferArrayItem(
      containerData,
      previousContainerData,
      currentIndex,
      previousIndex,
    );
    job.currentStageId = oldStageId;
  }

  updateJobStage(
    job: Job,
    newStageId: string,
    oldStageId: string,
    previousContainerData: Job[],
    containerData: Job[],
    previousIndex: number,
    currentIndex: number
  ): void {
    if (!job.id || !newStageId) {
      console.error('Missing job ID or stage ID', { job, newStageId });
      this.revertMove(previousContainerData, containerData, previousIndex, currentIndex, job, oldStageId);
      return;
    }

    // Optimistic update
    job.currentStageId = newStageId;

    this.jobService.updateStage(job.id, newStageId).subscribe({
      next: (updatedJob) => {
        console.log('Job stage updated successfully', updatedJob);
        // Update the local object with any server-side changes
        Object.assign(job, updatedJob);
      },
      error: (err) => {
        console.error('Failed to update stage', err);
        this.revertMove(previousContainerData, containerData, previousIndex, currentIndex, job, oldStageId);
        alert('Failed to update job status. Please try again.');
      }
    });
  }

  getOrderedStages(): WorkflowStage[] {
    return this.currentWorkflow ? this.currentWorkflow.stages : [];
  }

  openCreateJobDialog(): void {
    const dialogRef = this.dialog.open(JobFormComponent, {
      width: '600px',
      panelClass: 'premium-dialog',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedWorkflowId) {
        this.loadJobs(this.selectedWorkflowId);
      }
    });
  }

  openJobDetail(job: Job): void {
    this.router.navigate(['/jobs', job.id]);
  }
}
