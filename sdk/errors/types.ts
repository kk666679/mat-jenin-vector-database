export class OpenClawError extends Error {
  public code: string;
  public details: Record<string, any> | undefined;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'OpenClawError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AgentError extends OpenClawError {
  constructor(message: string, code: string = 'AGENT_ERROR', statusCode: number = 500, details?: Record<string, any>) {
    super(message, code, statusCode, details);
    this.name = 'AgentError';
  }
}

export class QueueError extends OpenClawError {
  constructor(message: string, code: string = 'QUEUE_ERROR', statusCode: number = 500, details?: Record<string, any>) {
    super(message, code, statusCode, details);
    this.name = 'QueueError';
  }
}

export class MLServiceError extends OpenClawError {
  constructor(message: string, code: string = 'ML_ERROR', statusCode: number = 500, details?: Record<string, any>) {
    super(message, code, statusCode, details);
    this.name = 'MLServiceError';
  }
}

export class ValidationError extends OpenClawError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', statusCode: number = 400, details?: Record<string, any>) {
    super(message, code, statusCode, details);
    this.name = 'ValidationError';
  }
}

export class WorkflowError extends OpenClawError {
  constructor(message: string, code: string = 'WORKFLOW_ERROR', statusCode: number = 500, details?: Record<string, any>) {
    super(message, code, statusCode, details);
    this.name = 'WorkflowError';
  }
}
