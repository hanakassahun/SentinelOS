import { NextRequest, NextResponse } from 'next/server';

const SERVER = process.env.SERVER_API_URL || 'http://localhost:3333';

async function proxy(req: NextRequest, method: 'GET' | 'POST') {
  const url = new URL(req.url);
  const response = await fetch(`${SERVER}/api/checkins${url.search}`, {
    method,
    ...(method === 'POST' ? {
      body: await req.text(),
      headers: { 'content-type': req.headers.get('content-type') || 'application/json' },
    } : { headers: { accept: 'application/json' } }),
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
  });
}

export function POST(req: NextRequest) {
  return proxy(req, 'POST');
}

export function GET(req: NextRequest) {
  return proxy(req, 'GET');
}