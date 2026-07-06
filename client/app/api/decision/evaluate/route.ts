import { NextRequest, NextResponse } from 'next/server';

const SERVER = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:3333';

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  const target = `${SERVER}${url.pathname}${url.search}`;

  const res = await fetch(target, {
    method: req.method,
    headers: {
      accept: 'application/json',
      ...Object.fromEntries(req.headers.entries()),
    },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
  });

  const body = await res.text();
  const headers = new Headers(res.headers);
  return new NextResponse(body, { status: res.status, headers });
}

export async function POST(req: NextRequest) {
  return proxy(req);
}
