import prisma from './prismaClient';

export async function getLogs(startDate?: Date, endDate?: Date) {
  const where: any = {};
  if (startDate || endDate) {
    where.timestamp = {} as any;
    if (startDate) where.timestamp.gte = startDate;
    if (endDate) where.timestamp.lte = endDate;
  }

  // default to ENERGY behavior logs for insights
  where.behaviorType = 'ENERGY';

  const logs = await prisma.log.findMany({
    where,
    orderBy: { timestamp: 'asc' },
  });

  return logs;
}

export default { getLogs };
