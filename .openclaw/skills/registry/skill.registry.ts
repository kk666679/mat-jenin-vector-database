import { EventEmitter } from 'events';
import { Logger } from '../../../sdk/shared/logger';

export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'embedding' | 'rag' | 'document' | 'orchestration' | 'evaluation' | 'custom';
  capabilities: string[];
  dependencies?: string[];
  config?: Record<string, any>;
  execute: (input: any, context: any) => Promise<any>;
  validate?: (input: any) => boolean;
  estimatedCost?: number;
  performance?: SkillPerformance;
}

export interface SkillPerformance {
  avgLatency: number;
  successRate: number;
  throughput: number;
  lastEvaluated: Date;
  historicalData: SkillMetric[];
}

export interface SkillMetric {
  timestamp: Date;
  latency: number;
  success: boolean;
  inputSize: number;
  outputSize: number;
  error?: string;
}

export class SkillRegistry extends EventEmitter {
  private skills: Map<string, Skill> = new Map();
  private logger: Logger;
  private metrics: Map<string, SkillMetric[]> = new Map();

  constructor(logger: Logger) {
    super();
    this.logger = logger.child({ service: 'SkillRegistry' });
  }

  register(skill: Skill): void {
    if (this.skills.has(skill.id)) {
      this.logger.warn(`Skill ${skill.id} already registered, overwriting`);
    }
    this.skills.set(skill.id, skill);
    this.metrics.set(skill.id, []);
    this.logger.info(`Skill registered: ${skill.id} v${skill.version}`);
    this.emit('skill-registered', skill);
  }

  unregister(id: string): boolean {
    const deleted = this.skills.delete(id);
    if (deleted) {
      this.metrics.delete(id);
      this.logger.info(`Skill unregistered: ${id}`);
      this.emit('skill-unregistered', id);
    }
    return deleted;
  }

  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  findByCategory(category: Skill['category']): Skill[] {
    return this.getAll().filter(s => s.category === category);
  }

  findByCapability(capability: string): Skill[] {
    return this.getAll().filter(s => s.capabilities.includes(capability));
  }

  async execute(skillId: string, input: any, context: any): Promise<any> {
    const skill = this.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    // Validate input
    if (skill.validate && !skill.validate(input)) {
      throw new Error(`Invalid input for skill ${skillId}`);
    }

    const startTime = Date.now();
    let success = true;
    let error: string | undefined;

    try {
      const result = await skill.execute(input, context);
      
      // Record metric
      this.recordMetric(skillId, {
        timestamp: new Date(),
        latency: Date.now() - startTime,
        success: true,
        inputSize: JSON.stringify(input).length,
        outputSize: JSON.stringify(result).length
      });

      this.emit('skill-executed', { skillId, success: true, latency: Date.now() - startTime });
      return result;
    } catch (err) {
      success = false;
      error = err.message;
      
      this.recordMetric(skillId, {
        timestamp: new Date(),
        latency: Date.now() - startTime,
        success: false,
        inputSize: JSON.stringify(input).length,
        outputSize: 0,
        error
      });

      this.emit('skill-executed', { skillId, success: false, error });
      throw err;
    }
  }

  private recordMetric(skillId: string, metric: SkillMetric): void {
    const metrics = this.metrics.get(skillId) || [];
    metrics.push(metric);
    
    // Keep last 1000 metrics
    if (metrics.length > 1000) {
      metrics.shift();
    }
    
    this.metrics.set(skillId, metrics);
  }

  getMetrics(skillId: string): SkillMetric[] {
    return this.metrics.get(skillId) || [];
  }

  getPerformance(skillId: string): SkillPerformance | undefined {
    const metrics = this.getMetrics(skillId);
    if (metrics.length === 0) return undefined;

    const successful = metrics.filter(m => m.success);
    const latencies = metrics.map(m => m.latency);

    return {
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      successRate: successful.length / metrics.length,
      throughput: metrics.length / (metrics[metrics.length - 1]?.timestamp?.getTime() - metrics[0]?.timestamp?.getTime()) * 1000,
      lastEvaluated: new Date(),
      historicalData: metrics.slice(-100)
    };
  }

  getStatus() {
    const skills = this.getAll();
    return {
      total: skills.length,
      skills: skills.map(s => ({
        id: s.id,
        name: s.name,
        version: s.version,
        category: s.category,
        capabilities: s.capabilities,
        performance: this.getPerformance(s.id)
      }))
    };
  }

  async initializeAll(): Promise<void> {
    for (const skill of this.skills.values()) {
      this.logger.info(`Initializing skill: ${skill.id}`);
      // Skill initialization logic here
    }
    this.logger.info('All skills initialized');
  }

  async shutdownAll(): Promise<void> {
    this.logger.info('Shutting down all skills');
    this.skills.clear();
    this.metrics.clear();
  }
}
