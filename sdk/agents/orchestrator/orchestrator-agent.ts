import type { Logger } from 'pino';
import { BaseAgent, type AgentContext, type AgentResult, type AgentTask } from '../core';
import { AgentRegistry } from '../registry';
import type { WorkflowDefinition, WorkflowExecutionResult } from './workflow';

import { enqueueAgentExecution } from '../../queue/agent';

export interface OrchestratePayload {
  workflow: WorkflowDefinition;
  context: AgentContext;
}

export class OrchestratorAgent extends BaseAgent<OrchestratePayload, WorkflowExecutionResult> {
  constructor(logger: Logger, _registry: AgentRegistry) {
    super('OrchestratorAgent', logger);

    this.capabilities = [
      {
        name: 'orchestrate',
        description: 'Execute multi-step workflow by enqueuing agent tasks',
      },
    ];
  }

  canHandle(task: AgentTask): boolean {
    return task.type === 'orchestrate';
  }

  async execute(task: AgentTask<OrchestratePayload>): Promise<AgentResult<WorkflowExecutionResult>> {
    const { workflow } = task.payload;
    const resultsByStep: Record<string, AgentResult> = {};
    const completedSteps: string[] = [];
    const failedSteps: string[] = [];

    const remaining = new Set(workflow.steps.map((s) => s.id));


    // Sequential dependency resolution (simple + deterministic).
    for (const step of workflow.steps) {
      if (!remaining.has(step.id)) continue;

      // Check dependencies
      if (step.dependencies?.length) {
        const allDone = step.dependencies.every((dep) => completedSteps.includes(dep));
        if (!allDone) {
          // Skip if dependencies weren't completed
          continue;
        }
      }

      try {
        // Enqueue subtask for execution; the actual execution is done by the worker
        // running the 'agent-execution' queue.
        // We store the job id as a lightweight placeholder result.
        const job = await enqueueAgentExecution({
          id: `${workflow.id}-${step.id}-${task.context.requestId}`,
          type: step.task.type,
          payload: step.task.payload,
          context: task.context,
        });

        const placeholder: AgentResult = {
          success: true,
          taskId: job.id?.toString() ?? `${workflow.id}-${step.id}`,
          metadata: { enqueued: true, stepId: step.id },
        };

        resultsByStep[step.id] = placeholder;
        completedSteps.push(step.id);
        remaining.delete(step.id);
      } catch (err: any) {
        failedSteps.push(step.id);
        if (workflow.onFailure === 'stop') {
          return {
            success: false,
            taskId: task.id,
            error: err?.message ?? String(err),
          };
        }
      }
    }

    return {
      success: failedSteps.length === 0,
      taskId: task.id,
      data: {
        workflowId: workflow.id,
        success: failedSteps.length === 0,
        completedSteps,
        resultsByStep,
        failedSteps,
      },
    };
  }
}

