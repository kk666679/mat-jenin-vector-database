import { Span } from './span';
import type { SpanContext } from './span';

export class Trace {
  private traceId: string;
  private spans: Span[] = [];
  private startTime: Date;
  private endTime?: Date;

  constructor(traceId?: string) {
    this.traceId = traceId || this.generateTraceId();
    this.startTime = new Date();
  }

  private generateTraceId(): string {
    return 'trace_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  startSpan(name: string, parentContext?: SpanContext): Span {
    const span = new Span(name, this.traceId, parentContext);
    this.spans.push(span);
    return span;
  }

  end(): void {
    this.endTime = new Date();
  }

  getTraceId(): string {
    return this.traceId;
  }

  getSpans(): Span[] {
    return this.spans;
  }

  getDuration(): number {
    const end = this.endTime || new Date();
    return end.getTime() - this.startTime.getTime();
  }

  toJSON(): any {
    return {
      traceId: this.traceId,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime?.toISOString(),
      duration: this.getDuration(),
      spans: this.spans.map(s => s.toJSON())
    };
  }
}
