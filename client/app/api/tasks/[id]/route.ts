import { NextRequest, NextResponse } from 'next/server';

const SERVER = process.env.SERVER_API_URL || 'http://localhost:3333';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const response = await fetch(`${SERVER}/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: await req.text(),
    headers: { 'content-type': req.headers.get('content-type') || 'application/json' },
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
  });
}