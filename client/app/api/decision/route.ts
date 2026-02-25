export const runtime = "node";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { description, tags } = await req.json();
    // Run risk logic (placeholder)
    const riskScore = Math.floor(Math.random() * 100);
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 70) riskLevel = 'high';
    else if (riskScore >= 40) riskLevel = 'medium';
    const explanationArr = [
      'Analyzed behavioral patterns for anomalies.',
      riskLevel === 'high'
        ? 'High risk detected due to recent activity.'
        : riskLevel === 'medium'
        ? 'Detected moderate risk due to recent activity.'
        : 'No critical threats identified.',
    ];
    // Store in Prisma
    const decision = await prisma.decision.create({
      data: {
        description,
        tags,
        riskScore,
        riskLevel,
        explanation: JSON.stringify(explanationArr),
      },
    });
    return NextResponse.json({
      id: decision.id,
      riskScore,
      riskLevel,
      explanation: explanationArr,
      createdAt: decision.createdAt,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process decision.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const decisions = await prisma.decision.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return NextResponse.json(
      decisions.map(d => ({
        id: d.id,
        description: d.description,
        tags: d.tags,
        riskScore: d.riskScore,
        riskLevel: d.riskLevel,
        explanation: JSON.parse(d.explanation),
        createdAt: d.createdAt,
      }))
    );
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch decisions.' }, { status: 500 });
  }
}
