import { AgentTask, AgentResult, AgentContext } from './agent.types';

export interface WorkflowDefinition {
  id: string;
  name?: string;
  description?: string;
  version?: string;
  steps: WorkflowStep[];
  onFailure?: 'stop' | 'continue';
  onSuccess?: (results: AgentResult[]) => void;
  onError?: (error: Error, step: WorkflowStep) => void;
}

export interface WorkflowStep {
  id: string;
  name?: string;
  description?: string;
  task: AgentTask;
  dependencies?: string[];
  onError?: (error: Error) => void;
  retryCount?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  steps: WorkflowStepExecution[];
  error?: string;
}

export interface WorkflowStepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: AgentResult;
  error?: string;
  startTime: Date;
  endTime?: Date;
}
