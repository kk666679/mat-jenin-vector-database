import { EventEmitter } from 'events';
import type { MetricData, HistogramData, SummaryData } from './types';

export class MetricsCollector extends EventEmitter {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private summaries: Map<string, number[]> = new Map();

  increment(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || 0;
    const nextValue = current + value;
    this.counters.set(key, nextValue);
    this.emit('metric', { name, type: 'counter', value: nextValue, ...(labels ? { labels } : {}), timestamp: new Date() });
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
    this.emit('metric', { name, type: 'gauge', value, ...(labels ? { labels } : {}), timestamp: new Date() });
  }

  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key)!.push(value);
    this.emit('metric', { name, type: 'histogram', value, ...(labels ? { labels } : {}), timestamp: new Date() });
  }

  observeSummary(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    if (!this.summaries.has(key)) {
      this.summaries.set(key, []);
    }
    this.summaries.get(key)!.push(value);
    this.emit('metric', { name, type: 'summary', value, ...(labels ? { labels } : {}), timestamp: new Date() });
  }

  getCounter(name: string, labels?: Record<string, string>): number {
    const key = this.getKey(name, labels);
    return this.counters.get(key) || 0;
  }

  getGauge(name: string, labels?: Record<string, string>): number {
    const key = this.getKey(name, labels);
    return this.gauges.get(key) || 0;
  }

  getHistogram(name: string, labels?: Record<string, string>): HistogramData {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) || [];
    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    const p50 = this.percentile(sorted, 50);
    const p90 = this.percentile(sorted, 90);
    const p95 = this.percentile(sorted, 95);
    const p99 = this.percentile(sorted, 99);

    return { name, count, sum, min, max, p50, p90, p95, p99 };
  }

  getSummary(name: string, labels?: Record<string, string>): SummaryData {
    const key = this.getKey(name, labels);
    const values = this.summaries.get(key) || [];
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = count > 0 ? sum / count : 0;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { name, count, sum, avg, min, max };
  }

  getAllMetrics(): MetricData[] {
    const metrics: MetricData[] = [];

    for (const [key, value] of this.counters) {
      const { name, labels } = this.parseKey(key);
      metrics.push({ name, type: 'counter', value, ...(labels ? { labels } : {}), timestamp: new Date() });
    }

    for (const [key, value] of this.gauges) {
      const { name, labels } = this.parseKey(key);
      metrics.push({ name, type: 'gauge', value, ...(labels ? { labels } : {}), timestamp: new Date() });
    }

    return metrics;
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.summaries.clear();
  }

  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}:${labelString}`;
  }

  private parseKey(key: string): { name: string; labels?: Record<string, string> } {
    const parts = key.split(':');
    if (parts.length === 1) {
      return { name: parts[0] ?? '' };
    }
    const name = parts[0] ?? '';
    const labelString = parts.slice(1).join(':');
    const labels: Record<string, string> = {};
    for (const pair of labelString.split(',')) {
      const [k, v] = pair.split('=');
      if (k && v !== undefined) {
        labels[k] = v;
      }
    }
    return { name, ...(Object.keys(labels).length > 0 ? { labels } : {}) };
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
  }
}
