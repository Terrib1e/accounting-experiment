export interface Job {
  id: string;
  name: string;

  workflowId: string;
  workflowName: string;

  currentStageId: string;
  currentStageName: string;

  contactId: string;
  contactName: string;

  dueDate?: string; // ISO Date
  assigneeId?: string;

  // UI helpers
  tasksCount?: number;
  completedTasksCount?: number;
}
