import type { HealthCheck, HealthReport, HealthCheckResult } from './types';

export class HealthReporter {
  private checks: HealthCheck[] = [];

  addCheck(check: HealthCheck): void {
    this.checks.push(check);
  }

  addChecks(checks: HealthCheck[]): void {
    this.checks.push(...checks);
  }

  async runChecks(): Promise<HealthReport> {
    const start = Date.now();
    const results: HealthCheckResult[] = [];

    for (const check of this.checks) {
      try {
        const timeout = check.timeout || 5000;
        const result = await Promise.race([
          check.check(),
          new Promise<HealthCheckResult>((_, reject) =>
            setTimeout(() => reject(new Error(`Health check ${check.name} timed out after ${timeout}ms`)), timeout)
          )
        ]);
        results.push(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({
          status: 'unhealthy',
          message: `Health check failed: ${message}`,
          details: { error: message }
        });
      }
    }

    const duration = Date.now() - start;
    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length
    };

    const status = summary.unhealthy > 0 ? 'unhealthy' : summary.degraded > 0 ? 'degraded' : 'healthy';

    return {
      status,
      timestamp: new Date(),
      duration,
      checks: results,
      summary
    };
  }

  async getStatus(): Promise<{ status: string; timestamp: Date; checks: HealthCheckResult[] }> {
    const report = await this.runChecks();
    return {
      status: report.status,
      timestamp: report.timestamp,
      checks: report.checks
    };
  }
}
