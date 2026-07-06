import { NextRequest, NextResponse } from 'next/server';

const SERVER = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const target = `${SERVER}${url.pathname}${url.search}`;
  const res = await fetch(target, { headers: { accept: 'application/json' } });
  const body = await res.text();
  const headers: Record<string, string> = {};
  const contentType = res.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;
  return new NextResponse(body, { status: res.status, headers });
}
