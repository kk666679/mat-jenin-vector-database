export class FileTransport {
  private path: string;
  private stream: any;

  constructor(path: string) {
    this.path = path;
  }

  getStream(): any {
    if (!this.stream) {
      this.stream = require('pino').destination(this.path);
    }
    return this.stream;
  }
}

export class HttpTransport {
  private url: string;
  private headers: Record<string, string>;

  constructor(url: string, headers: Record<string, string> = {}) {
    this.url = url;
    this.headers = headers;
  }

  async send(data: any): Promise<void> {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send log to HTTP transport:', error);
    }
  }
}
