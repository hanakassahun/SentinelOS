import { NextRequest, NextResponse } from 'next/server';
import { evaluateDecisionRisk } from '../../../../services/evaluateDecisionRisk';

export const runtime = "node";

export async function POST(req: NextRequest) {
  try {
    const { context, action } = await req.json();
    const riskResult = await evaluateDecisionRisk(context, action);
    return NextResponse.json(riskResult);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to evaluate decision risk', details: String(e) }, { status: 500 });
  }
}
