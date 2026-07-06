import { Evaluator } from '../evaluator';
import { IntentService } from '../../intent/config';
import { Logger } from '../../../sdk/shared/logger';

export interface IntentTestResult {
  text: string;
  expected: string;
  predicted: string;
  confidence: number;
  match: boolean;
  entities: {
    expected: Record<string, any>;
    predicted: Record<string, any>;
    match: boolean;
  };
}

export class IntentEvaluator {
  private logger: Logger;
  private intentService: IntentService;
  private tests: Map<string, IntentTestSuite> = new Map();

  constructor(logger: Logger, intentService: IntentService) {
    this.logger = logger.child({ service: 'IntentEvaluator' });
    this.intentService = intentService;
  }

  addTestSuite(suite: IntentTestSuite): void {
    this.tests.set(suite.id, suite);
    this.logger.info(`Test suite added: ${suite.id}`);
  }

  async evaluate(suiteId: string): Promise<IntentEvaluationResult> {
    const suite = this.tests.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`);
    }

    this.logger.info(`Evaluating intent test suite: ${suiteId}`);
    const results: IntentTestResult[] = [];
    
    for (const test of suite.tests) {
      try {
        const result = await this.intentService.detectIntent(test.text);
        const match = result.intent === test.expectedIntent;
        
        results.push({
          text: test.text,
          expected: test.expectedIntent,
          predicted: result.intent,
          confidence: result.confidence,
          match,
          entities: {
            expected: test.expectedEntities || {},
            predicted: result.entities || {},
            match: this.compareEntities(test.expectedEntities || {}, result.entities || {})
          }
        });
      } catch (error) {
        this.logger.error(`Test failed for text: ${test.text}`, error);
        results.push({
          text: test.text,
          expected: test.expectedIntent,
          predicted: 'error',
          confidence: 0,
          match: false,
          entities: {
            expected: test.expectedEntities || {},
            predicted: {},
            match: false
          }
        });
      }
    }

    const summary = this.summarizeResults(results);
    
    return {
      suiteId,
      timestamp: new Date(),
      results,
      summary
    };
  }

  private compareEntities(expected: Record<string, any>, predicted: Record<string, any>): boolean {
    const keys = new Set([...Object.keys(expected), ...Object.keys(predicted)]);
    for (const key of keys) {
      if (expected[key] !== predicted[key]) {
        return false;
      }
    }
    return true;
  }

  private summarizeResults(results: IntentTestResult[]): IntentSummary {
    const total = results.length;
    const matched = results.filter(r => r.match).length;
    const accuracy = matched / total;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / total;

    return {
      total,
      matched,
      accuracy,
      avgConfidence,
      byIntent: this.groupByIntent(results)
    };
  }

  private groupByIntent(results: IntentTestResult[]): Record<string, { total: number; matched: number }> {
    const groups: Record<string, { total: number; matched: number }> = {};
    
    for (const result of results) {
      if (!groups[result.expected]) {
        groups[result.expected] = { total: 0, matched: 0 };
      }
      groups[result.expected].total++;
      if (result.match) {
        groups[result.expected].matched++;
      }
    }
    
    return groups;
  }

  generateReport(result: IntentEvaluationResult): string {
    let report = `# Intent Evaluation Report: ${result.suiteId}\n\n`;
    report += `## Summary\n`;
    report += `- Accuracy: ${(result.summary.accuracy * 100).toFixed(2)}%\n`;
    report += `- Total Tests: ${result.summary.total}\n`;
    report += `- Matched: ${result.summary.matched}\n`;
    report += `- Avg Confidence: ${(result.summary.avgConfidence * 100).toFixed(2)}%\n\n`;
    
    report += `## By Intent\n`;
    for (const [intent, data] of Object.entries(result.summary.byIntent)) {
      const accuracy = (data.matched / data.total * 100).toFixed(2);
      report += `- ${intent}: ${accuracy}% (${data.matched}/${data.total})\n`;
    }
    
    report += `\n## Failed Tests\n`;
    const failed = result.results.filter(r => !r.match);
    for (const test of failed) {
      report += `- "${test.text}"\n`;
      report += `  Expected: ${test.expected}, Got: ${test.predicted}\n`;
    }
    
    return report;
  }
}

export interface IntentTestSuite {
  id: string;
  name: string;
  description: string;
  tests: IntentTest[];
}

export interface IntentTest {
  text: string;
  expectedIntent: string;
  expectedEntities?: Record<string, any>;
}

export interface IntentEvaluationResult {
  suiteId: string;
  timestamp: Date;
  results: IntentTestResult[];
  summary: IntentSummary;
}

export interface IntentSummary {
  total: number;
  matched: number;
  accuracy: number;
  avgConfidence: number;
  byIntent: Record<string, { total: number; matched: number }>;
}
