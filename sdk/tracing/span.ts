export interface SpanContext {
  traceId: string;
  spanId: string;
}

export class Span {
  private spanId: string;
  private traceId: string;
  private name: string;
  private startTime: Date;
  private endTime?: Date;
  private parentSpanId: string | undefined;
  private attributes: Record<string, any> = {};
  private events: Array<{ name: string; timestamp: Date; attributes?: Record<string, any> }> = [];

  constructor(name: string, traceId: string, parentContext?: SpanContext) {
    this.spanId = this.generateSpanId();
    this.traceId = traceId;
    this.name = name;
    this.startTime = new Date();
    this.parentSpanId = parentContext?.spanId;
  }

  private generateSpanId(): string {
    return 'span_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  setAttribute(key: string, value: any): void {
    this.attributes[key] = value;
  }

  setAttributes(attributes: Record<string, any>): void {
    this.attributes = { ...this.attributes, ...attributes };
  }

  addEvent(name: string, attributes?: Record<string, any>): void {
    const event: { name: string; timestamp: Date; attributes?: Record<string, any> } = {
      name,
      timestamp: new Date(),
    };

    if (attributes !== undefined) {
      event.attributes = attributes;
    }

    this.events.push(event);
  }

  end(): void {
    this.endTime = new Date();
  }

  getSpanId(): string {
    return this.spanId;
  }

  getTraceId(): string {
    return this.traceId;
  }

  getParentSpanId(): string | undefined {
    return this.parentSpanId;
  }

  getDuration(): number {
    const end = this.endTime || new Date();
    return end.getTime() - this.startTime.getTime();
  }

  toJSON(): any {
    return {
      spanId: this.spanId,
      traceId: this.traceId,
      parentSpanId: this.parentSpanId,
      name: this.name,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime?.toISOString(),
      duration: this.getDuration(),
      attributes: this.attributes,
      events: this.events
    };
  }
}
