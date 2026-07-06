import { EventEmitter } from 'events';
import { Logger } from '../../sdk/shared/logger';

export interface Metric {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
}

export interface MetricAggregation {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p95: number;
}

export class MetricsCollector extends EventEmitter {
  private logger: Logger;
  private metrics: Map<string, Metric[]> = new Map();
  private aggregations: Map<string, MetricAggregation> = new Map();
  private collectionInterval: NodeJS.Timeout | null = null;

  constructor(logger: Logger, intervalMs: number = 60000) {
    super();
    this.logger = logger.child({ service: 'MetricsCollector' });
    this.startCollection(intervalMs);
  }

  record(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric: Metric = {
      name,
      value,
      labels,
      timestamp: new Date()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(metric);
    this.emit('metric-recorded', metric);
  }

  increment(name: string, labels: Record<string, string> = {}, amount: number = 1): void {
    this.record(name, amount, labels);
  }

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    this.record(name, value, labels);
  }

  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Array.from(this.metrics.values()).flat();
  }

  getAggregation(name: string): MetricAggregation | undefined {
    return this.aggregations.get(name);
  }

  getAllAggregations(): MetricAggregation[] {
    return Array.from(this.aggregations.values());
  }

  private startCollection(intervalMs: number): void {
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
  }

  private collectMetrics(): void {
    for (const [name, metrics] of this.metrics) {
      if (metrics.length === 0) continue;
      
      const values = metrics.map(m => m.value);
      const sum = values.reduce((a, b) => a + b, 0);
      
      const aggregation: MetricAggregation = {
        name,
        count: values.length,
        sum,
        avg: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p95: this.percentile(values, 95)
      };
      
      this.aggregations.set(name, aggregation);
      this.emit('metric-aggregated', aggregation);
      
      // Keep only last 1000 metrics per name
      if (metrics.length > 1000) {
        this.metrics.set(name, metrics.slice(-1000));
      }
    }
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  async stop(): Promise<void> {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    this.logger.info('Metrics collection stopped');
  }
}
