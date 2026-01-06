export interface Task {
  id: string;
  title: string;
  description?: string;

  jobId: string;
  jobName: string;

  isCompleted: boolean;
  dueDate?: string;
  assigneeId?: string;
}
