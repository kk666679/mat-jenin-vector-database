import { EventEmitter } from 'events';
import type { Logger } from 'pino';

export interface AgentContext {
  tenantId: string;
  userId?: string;
  sessionId?: string;
  requestId: string;
  metadata?: Record<string, any>;
  timestamp: string; // ISO
}

export interface AgentTask<TPayload = any> {
  id: string;
  type: string;
  payload: TPayload;
  context: AgentContext;
  priority?: number;
  retryCount?: number;
  maxRetries?: number;
  timeoutMs?: number;
  dependencies?: string[];
}

export interface AgentResult<TData = any> {
  success: boolean;
  data?: TData;
  error?: string;
  metadata?: Record<string, any>;
  durationMs?: number;
  taskId: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
  examples?: unknown[];
}

export abstract class BaseAgent<TPayload = any, TResult = any> extends EventEmitter {
  public readonly name: string;
  protected readonly logger: Logger;
  public capabilities: AgentCapability[] = [];

  constructor(name: string, logger: Logger) {
    super();
    this.name = name;
    this.logger = logger;
  }

  abstract canHandle(task: AgentTask): boolean;
  abstract execute(task: AgentTask<TPayload>): Promise<AgentResult<TResult>>;

  protected async withMetrics<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.emit('metric', {
        operation,
        durationMs: Date.now() - start,
        success: true,
      });
      return result;
    } catch (err: any) {
      this.emit('metric', {
        operation,
        durationMs: Date.now() - start,
        success: false,
        error: err?.message ?? String(err),
      });
      throw err;
    }
  }
}

