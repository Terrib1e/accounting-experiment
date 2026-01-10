export interface WorkflowStage {
  id: string;
  name: string;
  orderIndex: number;
  initial: boolean;
  finalStage: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  stages: WorkflowStage[];
}
