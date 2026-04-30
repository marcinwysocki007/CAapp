import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const data = {
    buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? 'unknown',
    builtAt: process.env.NEXT_PUBLIC_BUILT_AT ?? 'unknown',
    envName: process.env.NEXT_PUBLIC_ENV_NAME ?? 'unknown',
    hostHeader: request.headers.get('host') ?? 'unknown',
    now: new Date().toISOString(),
    runtime: process.env.NEXT_RUNTIME ?? 'nodejs',
  };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
