import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { WorkflowService } from '../../../../core/services/workflow.service';
import { Workflow, WorkflowStage } from '../../../../core/models/workflow.model';

export interface WorkflowFormDialogData {
  workflow?: Workflow;
}

@Component({
  selector: 'app-workflow-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    DragDropModule
  ],
  templateUrl: './workflow-form.component.html',
  styleUrls: ['./workflow-form.component.css']
})
export class WorkflowFormComponent implements OnInit {
  form!: FormGroup;
  isEditing = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<WorkflowFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowFormDialogData,
    private workflowService: WorkflowService
  ) {}

  ngOnInit(): void {
    this.isEditing = !!this.data?.workflow;
    this.initForm();
  }

  initForm(): void {
    const workflow = this.data?.workflow;

    this.form = this.fb.group({
      name: [workflow?.name || '', Validators.required],
      description: [workflow?.description || ''],
      stages: this.fb.array(
        workflow?.stages?.map(s => this.createStageGroup(s)) || [this.createStageGroup()]
      )
    });
  }

  createStageGroup(stage?: WorkflowStage): FormGroup {
    return this.fb.group({
      id: [stage?.id || null],
      name: [stage?.name || '', Validators.required],
      orderIndex: [stage?.orderIndex || 0],
      isInitial: [stage?.isInitial || false],
      isFinal: [stage?.isFinal || false]
    });
  }

  get stages(): FormArray {
    return this.form.get('stages') as FormArray;
  }

  addStage(): void {
    this.stages.push(this.createStageGroup());
    this.updateOrderIndices();
  }

  removeStage(index: number): void {
    this.stages.removeAt(index);
    this.updateOrderIndices();
  }

  dropStage(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.stages.controls, event.previousIndex, event.currentIndex);
    this.updateOrderIndices();
  }

  updateOrderIndices(): void {
    this.stages.controls.forEach((ctrl, i) => {
      ctrl.get('orderIndex')?.setValue(i);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const formValue = this.form.value;

    const payload: Workflow = {
      id: this.data?.workflow?.id || '',
      name: formValue.name,
      description: formValue.description,
      stages: formValue.stages.map((s: any, i: number) => ({
        ...s,
        orderIndex: i,
        id: s.id || undefined
      }))
    };

    if (this.isEditing && this.data.workflow) {
      this.workflowService.updateWorkflow(this.data.workflow.id, payload).subscribe({
        next: (updated) => {
          this.isLoading = false;
          this.dialogRef.close(updated);
        },
        error: (err) => {
          console.error('Failed to update workflow', err);
          this.isLoading = false;
        }
      });
    } else {
      this.workflowService.createWorkflow(payload).subscribe({
        next: (created) => {
          this.isLoading = false;
          this.dialogRef.close(created);
        },
        error: (err) => {
          console.error('Failed to create workflow', err);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
