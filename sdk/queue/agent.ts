/**
 * OpenClaw-style Agent task queue definitions.
 *
 * This adds a generic "agent-execution" queue that can run tasks dispatched
 * by an API/workflow orchestrator.
 */

import { Job, Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { createQueue } from './index';

export const AGENT_QUEUE_NAMES = {
  AGENT_EXECUTION: 'agent-execution',
} as const;

export interface AgentExecutionJob {
  agentTask: {
    id: string;
    type: string;
    payload: any;
    context: {
      tenantId: string;
      userId?: string;
      sessionId?: string;
      requestId: string;
      metadata?: Record<string, any>;
      timestamp: string;
    };
    priority?: number;
    retryCount?: number;
    maxRetries?: number;
    timeoutMs?: number;
    dependencies?: string[];
  };
}

export function getAgentExecutionQueue(): Queue {
  return createQueue(AGENT_QUEUE_NAMES.AGENT_EXECUTION);
}

export function generateAgentTaskId(prefix = 'task'): string {
  return `${prefix}-${randomUUID()}`;
}

export async function enqueueAgentExecution(agentTask: AgentExecutionJob['agentTask']): Promise<Job<AgentExecutionJob>> {
  const queue = getAgentExecutionQueue();
  return queue.add(
    'execute',
    {
      agentTask,
    },
    {
      jobId: agentTask.id,
      priority: agentTask.priority ?? 1,
      attempts: agentTask.maxRetries ?? 3,
      // bullmq uses `timeout` for job timeout, but TS types may differ by
      // bullmq version; cast to keep runtime behaviour.
      ...(agentTask.timeoutMs ? { timeout: Math.ceil(agentTask.timeoutMs / 1000) } : {}),
    }
  );
}

