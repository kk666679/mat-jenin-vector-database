import { NextRequest, NextResponse } from 'next/server';

export interface CorsConfig {
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
}

export function corsMiddleware(config: CorsConfig) {
  return async function(req: NextRequest) {
    const origin = req.headers.get('origin') || '';
    const allowedOrigin = config.origins.includes(origin) ? origin : (config.origins[0] ?? '');

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', config.headers.join(', '));
    
    if (config.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    return response;
  };
}
