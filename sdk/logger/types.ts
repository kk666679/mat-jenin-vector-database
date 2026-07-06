export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error';
  name?: string;
  pretty?: boolean;
  silent?: boolean;
  formatters?: {
    level?: (level: string) => Record<string, any>;
    bindings?: (bindings: Record<string, any>) => Record<string, any>;
    log?: (log: Record<string, any>) => Record<string, any>;
  };
  transports?: TransportConfig[];
}

export interface TransportConfig {
  type: 'console' | 'file' | 'http' | 'custom';
  level?: string;
  options?: Record<string, any>;
}

export interface LogContext {
  service?: string;
  component?: string;
  traceId?: string;
  spanId?: string;
  [key: string]: any;
}

export interface Logger {
  debug: (msg: string, context?: LogContext) => void;
  info: (msg: string, context?: LogContext) => void;
  warn: (msg: string, context?: LogContext) => void;
  error: (msg: string, context?: LogContext) => void;
  fatal: (msg: string, context?: LogContext) => void;
  child: (bindings: Record<string, any>) => Logger;
}
