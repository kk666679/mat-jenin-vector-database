import type { Logger } from 'pino';
import type { AgentTask, AgentResult } from '../core';
import { AgentRegistry } from '../registry';

export class AgentExecutor {
  private readonly registry: AgentRegistry;
  constructor(_logger: Logger, registry: AgentRegistry) {
    this.registry = registry;
  }


  async execute(task: AgentTask): Promise<AgentResult> {
    const agent = this.registry.findByTask(task);
    if (!agent) {
      return {
        success: false,
        taskId: task.id,
        error: `No agent found for task type: ${task.type}`,
      };
    }

    return agent.execute(task as any);
  }
}

