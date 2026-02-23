/**
 * ML Monitoring and Observability
 * Based on machine-learning-engineer skill - Monitoring and Observability
 */

import type { InferenceMetrics, ModelHealthStatus } from './types';

// ============================================
// METRICS COLLECTOR
// ============================================

/**
 * Collect and track inference metrics
 */
export class MetricsCollector {
  private metrics: Map<string, InferenceMetrics> = new Map();
  private rawData: Array<{
    modelId: string;
    timestamp: number;
    latency: number;
    success: boolean;
  }> = [];
  private readonly maxRawDataSize: number;

  constructor(options: { maxRawDataSize?: number } = {}) {
    this.maxRawDataSize = options.maxRawDataSize || 10000;
  }

  /**
   * Record an inference
   */
  record(modelId: string, latency: number, success: boolean): void {
    const now = Date.now();
    
    // Add to raw data
    this.rawData.push({ modelId, timestamp: now, latency, success });
    
    // Trim raw data
    if (this.rawData.length > this.maxRawDataSize) {
      this.rawData = this.rawData.slice(-this.maxRawDataSize);
    }
    
    // Update aggregated metrics
    this.updateMetrics(modelId);
  }

  /**
   * Update aggregated metrics for a model
   */
  private updateMetrics(modelId: string): void {
    const windowStart = Date.now() - 60000; // 1 minute window
    const recentData = this.rawData.filter(
      d => d.modelId === modelId && d.timestamp > windowStart
    );

    if (recentData.length === 0) {
      this.metrics.delete(modelId);
      return;
    }

    const latencies = recentData.map(d => d.latency).sort((a, b) => a - b);
    const successCount = recentData.filter(d => d.success).length;
    
    const metrics: InferenceMetrics = {
      requestCount: recentData.length,
      successCount,
      errorCount: recentData.length - successCount,
      latencyP50: this.percentile(latencies, 0.5),
      latencyP95: this.percentile(latencies, 0.95),
      latencyP99: this.percentile(latencies, 0.99),
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      throughput: recentData.length, // requests per minute
      timestamp: new Date(),
    };

    this.metrics.set(modelId, metrics);
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }

  /**
   * Get metrics for a model
   */
  getMetrics(modelId: string): InferenceMetrics | undefined {
    return this.metrics.get(modelId);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, InferenceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get historical data for a model
   */
  getHistoricalData(modelId: string, durationMs: number = 60000): Array<{
    timestamp: number;
    latency: number;
    success: boolean;
  }> {
    const cutoff = Date.now() - durationMs;
    return this.rawData.filter(d => d.modelId === modelId && d.timestamp > cutoff);
  }

  /**
   * Clear metrics for a model
   */
  clear(modelId: string): void {
    this.metrics.delete(modelId);
    this.rawData = this.rawData.filter(d => d.modelId !== modelId);
  }

  /**
   * Clear all metrics
   */
  clearAll(): void {
    this.metrics.clear();
    this.rawData = [];
  }
}

// ============================================
// HEALTH CHECKER
// ============================================

/**
 * Monitor model health
 */
export class HealthChecker {
  private healthStatus: Map<string, ModelHealthStatus> = new Map();
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();
  private checkFunction: (modelId: string) => Promise<ModelHealthStatus>;

  constructor(
    checkFunction: (modelId: string) => Promise<ModelHealthStatus>
  ) {
    this.checkFunction = checkFunction;
  }

  /**
   * Check health for a model
   */
  async check(modelId: string): Promise<ModelHealthStatus> {
    try {
      const status = await this.checkFunction(modelId);
      this.healthStatus.set(modelId, status);
      return status;
    } catch (error) {
      const status: ModelHealthStatus = {
        modelId,
        status: 'unhealthy',
        lastChecked: new Date(),
        latency: 0,
        errorRate: 1,
        details: { error: (error as Error).message },
      };
      this.healthStatus.set(modelId, status);
      return status;
    }
  }

  /**
   * Start periodic health checks
   */
  startPeriodicCheck(modelId: string, intervalMs: number = 60000): void {
    // Clear existing interval
    this.stopPeriodicCheck(modelId);

    // Run initial check
    this.check(modelId);

    // Set up periodic checks
    const interval = setInterval(() => {
      this.check(modelId);
    }, intervalMs);

    this.checkIntervals.set(modelId, interval);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicCheck(modelId: string): void {
    const interval = this.checkIntervals.get(modelId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(modelId);
    }
  }

  /**
   * Get health status for a model
   */
  getStatus(modelId: string): ModelHealthStatus | undefined {
    return this.healthStatus.get(modelId);
  }

  /**
   * Get all health statuses
   */
  getAllStatuses(): ModelHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Check if model is healthy
   */
  isHealthy(modelId: string): boolean {
    const status = this.healthStatus.get(modelId);
    return status?.status === 'healthy';
  }

  /**
   * Stop all periodic checks
   */
  stopAll(): void {
    for (const interval of this.checkIntervals.values()) {
      clearInterval(interval);
    }
    this.checkIntervals.clear();
  }
}

// ============================================
// ALERT MANAGER
// ============================================

export interface AlertRule {
  name: string;
  condition: 'latency_p99' | 'error_rate' | 'throughput' | 'health';
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  cooldownMs: number;
  callback: (modelId: string, value: number) => void;
}

export interface Alert {
  id: string;
  modelId: string;
  rule: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

/**
 * Manage alerts based on metrics
 */
export class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Alert[] = [];
  private lastAlertTime: Map<string, number> = new Map();
  private collector: MetricsCollector;

  constructor(collector: MetricsCollector) {
    this.collector = collector;
  }

  /**
   * Add alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * Remove alert rule
   */
  removeRule(name: string): void {
    this.rules.delete(name);
  }

  /**
   * Check all rules and trigger alerts
   */
  checkRules(modelId: string): void {
    const metrics = this.collector.getMetrics(modelId);
    if (!metrics) return;

    for (const rule of this.rules.values()) {
      let value: number;

      switch (rule.condition) {
        case 'latency_p99':
          value = metrics.latencyP99;
          break;
        case 'error_rate':
          value = metrics.requestCount > 0 
            ? metrics.errorCount / metrics.requestCount 
            : 0;
          break;
        case 'throughput':
          value = metrics.throughput;
          break;
        default:
          continue;
      }

      const triggered = this.evaluateCondition(value, rule.threshold, rule.operator);
      
      if (triggered && this.canAlert(modelId, rule.name, rule.cooldownMs)) {
        this.triggerAlert(modelId, rule.name, value, rule.threshold, rule.callback);
      }
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Check if can alert (cooldown)
   */
  private canAlert(modelId: string, ruleName: string, cooldownMs: number): boolean {
    const key = `${modelId}:${ruleName}`;
    const lastTime = this.lastAlertTime.get(key) || 0;
    return Date.now() - lastTime > cooldownMs;
  }

  /**
   * Trigger alert
   */
  private triggerAlert(
    modelId: string,
    ruleName: string,
    value: number,
    threshold: number,
    callback: (modelId: string, value: number) => void
  ): void {
    const key = `${modelId}:${ruleName}`;
    this.lastAlertTime.set(key, Date.now());

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      rule: ruleName,
      value,
      threshold,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.push(alert);
    callback(modelId, value);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Clear old alerts
   */
  clearAlerts(olderThanMs: number = 86400000): void {
    const cutoff = Date.now() - olderThanMs;
    this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoff);
  }
}

// ============================================
// CIRCUIT BREAKER
// ============================================

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  halfOpenMaxRequests: number;
}

export type CircuitState = 'closed' | 'open' | 'half_open';

/**
 * Circuit breaker for fault tolerance
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 3,
      timeoutMs: config.timeoutMs || 30000,
      halfOpenMaxRequests: config.halfOpenMaxRequests || 3,
    };
  }

  /**
   * Execute function with circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half_open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle success
   */
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === 'half_open') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failure
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'half_open') {
      this.state = 'open';
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }

  /**
   * Check if should attempt reset
   */
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime > this.config.timeoutMs;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

// ============================================
// OBSERVABILITY WRAPPER
// ============================================

/**
 * Wrap inference client with observability
 */
export class ObservableClient {
  private client: any;
  private collector: MetricsCollector;
  private healthChecker?: HealthChecker;
  private circuitBreaker?: CircuitBreaker;

  constructor(
    client: any,
collector: MetricsCollector,
options?: {
      healthChecker?: HealthChecker;
      circuitBreaker?: CircuitBreaker;
    }
  ) {
    this.client = client;
    this.collector = collector;
    if (options?.healthChecker !== undefined) {
      this.healthChecker = options.healthChecker;
    }
    if (options?.circuitBreaker !== undefined) {
      this.circuitBreaker = options.circuitBreaker;
    }
  }

  /**
   * Infer with full observability
   */
  async infer(request: any): Promise<any> {
    const startTime = Date.now();
    const modelId = request.modelId || 'default';

    try {
      let result;
      
      if (this.circuitBreaker) {
        result = await this.circuitBreaker.execute(() => this.client.infer(request));
      } else {
        result = await this.client.infer(request);
      }

      const latency = Date.now() - startTime;
      this.collector.record(modelId, latency, true);

      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.collector.record(modelId, latency, false);
      throw error;
    }
  }

  /**
   * Get metrics
   */
  getMetrics(modelId?: string): InferenceMetrics | Map<string, InferenceMetrics> | undefined {
    if (modelId) {
      return this.collector.getMetrics(modelId);
    }
    return this.collector.getAllMetrics();
  }

  /**
   * Check health
   */
  async checkHealth(modelId: string): Promise<ModelHealthStatus | undefined> {
    if (this.healthChecker) {
      return this.healthChecker.check(modelId);
    }
    return undefined;
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create metrics collector
 */
export function createMetricsCollector(options?: { maxRawDataSize?: number }): MetricsCollector {
  return new MetricsCollector(options);
}

/**
 * Create health checker
 */
export function createHealthChecker(
  checkFunction: (modelId: string) => Promise<ModelHealthStatus>
): HealthChecker {
  return new HealthChecker(checkFunction);
}

/**
 * Create alert manager
 */
export function createAlertManager(collector: MetricsCollector): AlertManager {
  return new AlertManager(collector);
}

/**
 * Create circuit breaker
 */
export function createCircuitBreaker(config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
  return new CircuitBreaker(config);
}

