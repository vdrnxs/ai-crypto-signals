import { NextResponse } from 'next/server';
import type { createLogger } from './logger';

type RouteLogger = ReturnType<typeof createLogger>;

/**
 * Standard catch-all handler for API routes: logs the error and returns a
 * uniform { error, processing_time_ms } JSON response with 500 status.
 */
export function handleRouteError(log: Pick<RouteLogger, 'error'>, error: unknown, startTime: number) {
  log.error('Unhandled error', error);

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: Date.now() - startTime,
    },
    { status: 500 }
  );
}
