import { MetricsCollector } from './collector';
import type { MetricData } from './types';

export class MetricsReporter {
  private collector: MetricsCollector;
  private interval: NodeJS.Timeout | null = null;

  constructor(collector: MetricsCollector) {
    this.collector = collector;
  }

  start(intervalMs: number = 60000): void {
    this.interval = setInterval(() => {
      this.report();
    }, intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async report(): Promise<void> {
    const metrics = this.collector.getAllMetrics();
    console.log('📊 Metrics Report:', metrics);
  }

  async export(format: 'json' | 'prometheus' = 'json'): Promise<string> {
    const metrics = this.collector.getAllMetrics();
    
    if (format === 'prometheus') {
      return this.toPrometheus(metrics);
    }
    
    return JSON.stringify(metrics, null, 2);
  }

  private toPrometheus(metrics: MetricData[]): string {
    let output = '';
    
    for (const metric of metrics) {
      const labels = metric.labels || {};
      const labelString = Object.entries(labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      
      const metricName = `openclaw_${metric.name}`;
      const labelsPart = labelString ? `{${labelString}}` : '';
      
      output += `${metricName}${labelsPart} ${metric.value}\n`;
    }
    
    return output;
  }
}
