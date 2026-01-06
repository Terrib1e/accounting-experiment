export interface WorkflowStage {
  id: string;
  name: string;
  orderIndex: number;
  isInitial: boolean;
  isFinal: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  stages: WorkflowStage[];
}
