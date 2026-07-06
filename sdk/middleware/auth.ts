import { NextRequest, NextResponse } from 'next/server';

export interface AuthConfig {
  secret: string;
  tokenHeader: string;
  tokenPrefix: string;
}

export function authMiddleware(config: AuthConfig) {
  return async function(req: NextRequest) {
    const token = req.headers.get(config.tokenHeader) || '';
    const authToken = token.replace(config.tokenPrefix, '');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      // Validate token
      // Add your token validation logic here
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  };
}
