import { EventEmitter } from 'events';
import { Logger } from '../../sdk/shared/logger';
import { SkillRegistry, Skill } from '../skills/registry/skill.registry';

export interface EvaluationResult {
  skillId: string;
  timestamp: Date;
  score: number;
  metrics: Record<string, any>;
  details: {
    passed: number;
    failed: number;
    total: number;
    errors: string[];
  };
  benchmark: string;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
  weight?: Record<string, number>;
}

export interface TestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  validator: (output: any, expected: any) => boolean;
  weight?: number;
}

export class Evaluator extends EventEmitter {
  private logger: Logger;
  private registry: SkillRegistry;
  private benchmarks: Map<string, Benchmark> = new Map();
  private results: Map<string, EvaluationResult[]> = new Map();

  constructor(logger: Logger, registry: SkillRegistry) {
    super();
    this.logger = logger.child({ service: 'Evaluator' });
    this.registry = registry;
  }

  registerBenchmark(benchmark: Benchmark): void {
    this.benchmarks.set(benchmark.id, benchmark);
    this.logger.info(`Benchmark registered: ${benchmark.id}`);
  }

  async evaluateSkill(skillId: string, benchmarkId: string): Promise<EvaluationResult> {
    const skill = this.registry.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    const benchmark = this.benchmarks.get(benchmarkId);
    if (!benchmark) {
      throw new Error(`Benchmark ${benchmarkId} not found`);
    }

    this.logger.info(`Evaluating skill ${skillId} against benchmark ${benchmarkId}`);
    this.emit('evaluation-started', { skillId, benchmarkId });

    const startTime = Date.now();
    const passed: string[] = [];
    const failed: string[] = [];
    const errors: string[] = [];
    const metrics: Record<string, any> = {};

    for (const test of benchmark.tests) {
      try {
        const result = await this.registry.execute(skillId, test.input, {});
        const isValid = test.validator(result, test.expectedOutput);
        
        if (isValid) {
          passed.push(test.id);
        } else {
          failed.push(test.id);
        }

        // Record metrics
        metrics[`test_${test.id}`] = isValid;
      } catch (error) {
        errors.push(`${test.id}: ${error.message}`);
        failed.push(test.id);
      }
    }

    const total = benchmark.tests.length;
    const score = passed.length / total;

    const result: EvaluationResult = {
      skillId,
      timestamp: new Date(),
      score,
      metrics: {
        ...metrics,
        accuracy: score,
        latency: Date.now() - startTime
      },
      details: {
        passed: passed.length,
        failed: failed.length,
        total,
        errors
      },
      benchmark: benchmarkId
    };

    // Store result
    if (!this.results.has(skillId)) {
      this.results.set(skillId, []);
    }
    this.results.get(skillId)!.push(result);

    // Update skill performance
    if (skill.performance) {
      skill.performance.successRate = score;
      skill.performance.lastEvaluated = new Date();
    }

    this.emit('evaluation-completed', { skillId, benchmarkId, result });
    this.logger.info(`Evaluation completed for skill ${skillId}: ${(score * 100).toFixed(2)}%`);

    return result;
  }

  async evaluateAllSkills(benchmarkId: string): Promise<Record<string, EvaluationResult>> {
    const results: Record<string, EvaluationResult> = {};
    const skills = this.registry.getAll();

    for (const skill of skills) {
      try {
        results[skill.id] = await this.evaluateSkill(skill.id, benchmarkId);
      } catch (error) {
        this.logger.error(`Failed to evaluate skill ${skill.id}:`, error);
        results[skill.id] = {
          skillId: skill.id,
          timestamp: new Date(),
          score: 0,
          metrics: {},
          details: {
            passed: 0,
            failed: 0,
            total: 0,
            errors: [error.message]
          },
          benchmark: benchmarkId
        };
      }
    }

    return results;
  }

  getResults(skillId: string): EvaluationResult[] {
    return this.results.get(skillId) || [];
  }

  getBestResult(skillId: string): EvaluationResult | undefined {
    const results = this.getResults(skillId);
    if (results.length === 0) return undefined;
    return results.reduce((best, current) => current.score > best.score ? current : best);
  }

  getBenchmark(id: string): Benchmark | undefined {
    return this.benchmarks.get(id);
  }

  listBenchmarks(): string[] {
    return Array.from(this.benchmarks.keys());
  }

  generateReport(skillId: string): string {
    const results = this.getResults(skillId);
    if (results.length === 0) {
      return `No evaluation results for skill ${skillId}`;
    }

    const best = this.getBestResult(skillId);
    const latest = results[results.length - 1];

    let report = `# Evaluation Report for ${skillId}\n\n`;
    report += `## Summary\n`;
    report += `- Best Score: ${(best?.score || 0) * 100}%\n`;
    report += `- Latest Score: ${(latest?.score || 0) * 100}%\n`;
    report += `- Total Evaluations: ${results.length}\n`;
    report += `- Last Evaluated: ${latest?.timestamp.toISOString() || 'N/A'}\n\n`;

    report += `## Detailed Results\n`;
    for (const result of results.slice(-5)) {
      report += `- ${result.timestamp.toISOString()}: ${(result.score * 100).toFixed(2)}% (${result.details.passed}/${result.details.total})\n`;
    }

    return report;
  }

  async exportResults(skillId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const results = this.getResults(skillId);
    
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    } else {
      // CSV format
      const headers = ['timestamp', 'skillId', 'score', 'passed', 'failed', 'total', 'errors'];
      const rows = results.map(r => [
        r.timestamp.toISOString(),
        r.skillId,
        r.score,
        r.details.passed,
        r.details.failed,
        r.details.total,
        r.details.errors.join('; ')
      ]);
      
      return [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
    }
  }
}
