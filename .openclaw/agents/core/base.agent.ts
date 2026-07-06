import { EventEmitter } from 'events';
import { Logger } from '../../../sdk/shared/logger';

export interface AgentContext {
  tenantId: string;
  userId?: string;
  sessionId?: string;
  requestId: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AgentTask<T = any> {
  id: string;
  type: string;
  payload: T;
  context: AgentContext;
  priority?: number;
  retryCount?: number;
  maxRetries?: number;
  timeout?: number;
  dependencies?: string[];
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
  duration?: number;
  taskId: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  examples?: any[];
  version?: string;
}

export abstract class BaseAgent extends EventEmitter {
  protected logger: Logger;
  protected name: string;
  protected version: string;
  protected capabilities: AgentCapability[] = [];
  protected isRunning: boolean = false;
  protected metrics: Map<string, number[]> = new Map();

  constructor(name: string, version: string, logger: Logger) {
    super();
    this.name = name;
    this.version = version;
    this.logger = logger.child({ agent: name, version });
  }

  abstract canHandle(task: AgentTask): boolean;
  abstract execute(task: AgentTask): Promise<AgentResult>;
  
  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  getInfo() {
    return {
      name: this.name,
      version: this.version,
      capabilities: this.capabilities.map(c => c.name),
      isRunning: this.isRunning,
      metrics: this.getMetrics()
    };
  }

  protected async withMetrics<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.recordMetric(operation, duration, true);
      this.emit('metric', { operation, duration, success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration, false);
      this.emit('metric', { operation, duration, success: false, error });
      throw error;
    }
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          this.logger.warn(`Retry ${attempt}/${maxRetries} for operation`);
        }
      }
    }
    throw lastError!;
  }

  private recordMetric(operation: string, duration: number, success: boolean) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  private getMetrics() {
    const result: Record<string, any> = {};
    for (const [operation, durations] of this.metrics) {
      result[operation] = {
        count: durations.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        p95: this.percentile(durations, 95)
      };
    }
    return result;
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  async validateTask(task: AgentTask): Promise<boolean> {
    return true;
  }

  async initialize(): Promise<void> {
    this.isRunning = true;
    this.logger.info('Agent initialized');
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Agent shutdown');
  }
}
