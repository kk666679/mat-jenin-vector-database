export type SkillCategory =
  | 'embedding'
  | 'rag'
  | 'document'
  | 'orchestration'
  | 'evaluation'
  | 'custom';

export interface SkillMetricPoint {
  timestamp: string; // ISO8601
  durationMs?: number;
  success?: boolean;
  error?: string;
}

export interface SkillPerformance {
  avgLatency: number; // ms
  successRate: number; // 0..1
  throughput: number; // exec/min or exec/hour depending on aggregation
  lastEvaluated: string; // ISO8601
  historicalData: SkillMetricPoint[];
}

export interface SkillDefinition<TInput = any, TOutput = any> {
  /** Stable identifier, e.g. `rag-v1` */
  id: string;
  name: string;
  version: string;
  description: string;
  category: SkillCategory;

  /** Tags for discovery */
  capabilities: string[];

  config?: Record<string, unknown>;
  estimatedCost?: number; // cost per execution (arbitrary unit)

  /** Optional input validation */
  validate?: (input: TInput) => boolean | Promise<boolean>;

  /** Execution */
  execute: (input: TInput, context: unknown) => Promise<TOutput>;

  /** Optional performance metadata */
  performance?: Partial<SkillPerformance>;
}

