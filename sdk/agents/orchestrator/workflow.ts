import type { AgentTask, AgentResult } from '../core';

export type WorkflowFailureMode = 'stop' | 'continue';

export interface WorkflowStep {
  id: string;
  task: AgentTask<any>;
  dependencies?: string[];
}

export interface WorkflowDefinition {
  id: string;
  steps: WorkflowStep[];
  onFailure?: WorkflowFailureMode;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  success: boolean;
  completedSteps: string[];
  resultsByStep: Record<string, AgentResult>;
  failedSteps: string[];
}

