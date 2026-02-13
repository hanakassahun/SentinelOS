import { NextRequest, NextResponse } from 'next/server';

const SERVER = process.env.SERVER_API_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const target = SERVER + '/api/insights/simple' + url.search;
  const res = await fetch(target, { headers: { accept: 'application/json' } });
  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
}
