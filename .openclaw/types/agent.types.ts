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

export interface AgentInfo {
  name: string;
  version: string;
  capabilities: string[];
  isRunning: boolean;
  metrics: Record<string, any>;
}
