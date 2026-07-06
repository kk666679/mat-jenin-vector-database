import { z } from 'zod';
import { WorkflowDefinition, WorkflowStep } from '../types/workflow.types';
import { AgentTaskSchema } from './agent.validator';

export const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  task: AgentTaskSchema,
  dependencies: z.array(z.string()).optional(),
  retryCount: z.number().int().min(0).max(10).optional()
});

export const WorkflowDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  steps: z.array(WorkflowStepSchema),
  onFailure: z.enum(['stop', 'continue']).optional(),
  onSuccess: z.function().optional(),
  onError: z.function().optional()
});

export function validateWorkflow(workflow: any): { valid: boolean; errors?: string[] } {
  try {
    WorkflowDefinitionSchema.parse(workflow);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Invalid workflow structure'] };
  }
}

export function validateWorkflowStep(step: any): { valid: boolean; errors?: string[] } {
  try {
    WorkflowStepSchema.parse(step);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Invalid workflow step structure'] };
  }
}

export function validateWorkflowDependencies(workflow: WorkflowDefinition): { valid: boolean; errors?: string[] } {
  const stepIds = new Set(workflow.steps.map(s => s.id));
  const errors: string[] = [];

  for (const step of workflow.steps) {
    if (step.dependencies) {
      for (const dep of step.dependencies) {
        if (!stepIds.has(dep)) {
          errors.push(`Step "${step.id}" depends on non-existent step "${dep}"`);
        }
      }
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
