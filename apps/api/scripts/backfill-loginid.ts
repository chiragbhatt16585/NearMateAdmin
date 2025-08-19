import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getPrefixFromName(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || 'X';
  const last = (parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'X')[0] || 'X';
  return (first + last).toUpperCase();
}

async function main() {
  const partners = await prisma.partner.findMany({ select: { id: true, name: true, loginId: true } });
  const prefixToMax: Record<string, number> = {};

  // compute current max numbers per prefix
  for (const p of partners) {
    if (p.loginId) {
      const prefix = p.loginId.slice(0, 2);
      const num = parseInt(p.loginId.slice(2), 10);
      if (!Number.isNaN(num)) prefixToMax[prefix] = Math.max(prefixToMax[prefix] || 0, num);
    }
  }

  for (const p of partners) {
    if (!p.loginId) {
      const prefix = getPrefixFromName(p.name);
      const next = (prefixToMax[prefix] || 0) + 1;
      prefixToMax[prefix] = next;
      const loginId = `${prefix}${next.toString().padStart(6, '0')}`;
      await prisma.partner.update({ where: { id: p.id }, data: { loginId } });
      console.log(`Set loginId for ${p.name}: ${loginId}`);
    }
  }
}

main().finally(() => prisma.$disconnect());


