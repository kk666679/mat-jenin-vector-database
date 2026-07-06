import type { SpanContext } from './span';

export class TracingContext {
  private static current: Map<string, any> = new Map();

  static set(key: string, value: any): void {
    this.current.set(key, value);
  }

  static get(key: string): any {
    return this.current.get(key);
  }

  static getTraceId(): string | undefined {
    return this.current.get('traceId');
  }

  static getSpanId(): string | undefined {
    return this.current.get('spanId');
  }

  static getSpanContext(): SpanContext | undefined {
    const traceId = this.getTraceId();
    const spanId = this.getSpanId();
    if (traceId && spanId) {
      return { traceId, spanId };
    }
    return undefined;
  }

  static setTraceId(traceId: string): void {
    this.set('traceId', traceId);
  }

  static setSpanId(spanId: string): void {
    this.set('spanId', spanId);
  }

  static clear(): void {
    this.current.clear();
  }
}
