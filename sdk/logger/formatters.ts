export function formatError(error: Error): Record<string, any> {
  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...(error as any)
  };
}

export function formatRequest(req: any): Record<string, any> {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body
  };
}

export function formatResponse(res: any): Record<string, any> {
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body
  };
}

export function formatDuration(startTime: number): number {
  return Date.now() - startTime;
}
