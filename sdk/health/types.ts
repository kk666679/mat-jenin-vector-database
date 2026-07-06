export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  timeout?: number;
  critical?: boolean;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, any>;
  duration?: number;
  timestamp?: Date;
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  duration: number;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}
