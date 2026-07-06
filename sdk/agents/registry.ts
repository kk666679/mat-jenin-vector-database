import type { Logger } from 'pino';
import type { AgentTask, BaseAgent } from './core';

export class AgentRegistry {
  private readonly agents = new Map<string, BaseAgent<any, any>>();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ registry: 'AgentRegistry' });
  }

  register(agent: BaseAgent<any, any>): void {
    if (this.agents.has(agent.name)) {
      throw new Error(`Agent already registered: ${agent.name}`);
    }
    this.agents.set(agent.name, agent);
    this.logger.info({ agent: agent.name }, 'Registered agent');
  }

  findByTask(task: AgentTask): BaseAgent<any, any> | undefined {
    for (const agent of this.agents.values()) {
      if (agent.canHandle(task)) return agent;
    }
    return undefined;
  }
}

