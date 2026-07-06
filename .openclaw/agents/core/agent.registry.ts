import { BaseAgent } from './base.agent';
import { Logger } from '../../../sdk/shared/logger';

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ service: 'AgentRegistry' });
  }

  register(agent: BaseAgent): void {
    if (this.agents.has(agent.name)) {
      this.logger.warn(`Agent ${agent.name} already registered, overwriting`);
    }
    this.agents.set(agent.name, agent);
    this.logger.info(`Agent registered: ${agent.name} v${agent.version}`);
  }

  unregister(name: string): boolean {
    const deleted = this.agents.delete(name);
    if (deleted) {
      this.logger.info(`Agent unregistered: ${name}`);
    }
    return deleted;
  }

  get(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  findByCapability(capability: string): BaseAgent[] {
    const result: BaseAgent[] = [];
    for (const agent of this.agents.values()) {
      const caps = agent.getCapabilities().map(c => c.name);
      if (caps.includes(capability)) {
        result.push(agent);
      }
    }
    return result;
  }

  findForTask(taskType: string): BaseAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.canHandle({ type: taskType } as any)) {
        return agent;
      }
    }
    return undefined;
  }

  getStatus() {
    const agents = this.getAll();
    return {
      total: agents.length,
      agents: agents.map(a => a.getInfo())
    };
  }

  async initializeAll(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.initialize();
    }
    this.logger.info('All agents initialized');
  }

  async shutdownAll(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.shutdown();
    }
    this.logger.info('All agents shutdown');
  }
}
