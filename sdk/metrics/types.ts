export interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

export interface MetricData {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

export interface HistogramData {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface SummaryData {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}
