import { AgentTask, AgentContext, AgentResult } from '../types/agent.types';
import { z } from 'zod';

export const AgentContextSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date()
});

export const AgentTaskSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  payload: z.any(),
  context: AgentContextSchema,
  priority: z.number().int().min(0).max(10).optional(),
  retryCount: z.number().int().min(0).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  timeout: z.number().int().min(1000).optional(),
  dependencies: z.array(z.string()).optional()
});

export const AgentResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  duration: z.number().optional(),
  taskId: z.string()
});

export function validateAgentTask(task: any): { valid: boolean; errors?: string[] } {
  try {
    AgentTaskSchema.parse(task);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Invalid task structure'] };
  }
}

export function validateAgentContext(context: any): { valid: boolean; errors?: string[] } {
  try {
    AgentContextSchema.parse(context);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Invalid context structure'] };
  }
}
