import { NextResponse } from 'next/server';
import { handleError } from '../errors/handlers';

export function errorMiddleware() {
  return async function(_req: Request, error: Error) {
    const handledError = handleError(error);
    
    return NextResponse.json(
      {
        error: handledError.message,
        code: handledError.code,
        details: handledError.details
      },
      { status: handledError.statusCode }
    );
  };
}
