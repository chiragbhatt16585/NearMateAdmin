import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nearmate.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrator',
      role: 'admin',
      hashedPassword,
    },
  });

  const john = await prisma.partner.upsert({
    where: { email: 'john@example.com' },
    update: { name: 'John Doe', phone: '9990001111' },
    create: { name: 'John Doe', phone: '9990001111', email: 'john@example.com' },
  });
  await prisma.partnerKyc.upsert({
    where: { partnerId: john.id },
    update: { idType: 'Aadhar Card', idNumber: 'XXXXXXXXX', status: 'verified' },
    create: { partnerId: john.id, idType: 'Aadhar Card', idNumber: 'XXXXXXXXX', status: 'verified' },
  });
  await prisma.partnerBank.upsert({
    where: { partnerId: john.id },
    update: { accountName: 'John Doe', accountNo: '1234567890', ifsc: 'HDFC0001234', bankName: 'HDFC Bank' },
    create: { partnerId: john.id, accountName: 'John Doe', accountNo: '1234567890', ifsc: 'HDFC0001234', bankName: 'HDFC Bank' },
  });

  const jane = await prisma.partner.upsert({
    where: { email: 'jane@example.com' },
    update: { name: 'Jane Roe', phone: '9990002222' },
    create: { name: 'Jane Roe', phone: '9990002222', email: 'jane@example.com' },
  });
  await prisma.partnerKyc.upsert({
    where: { partnerId: jane.id },
    update: { idType: 'Pan Card', idNumber: 'XXXXXXX', status: 'pending' },
    create: { partnerId: jane.id, idType: 'Pan Card', idNumber: 'XXXXXXX', status: 'pending' },
  });
  await prisma.partnerBank.upsert({
    where: { partnerId: jane.id },
    update: { accountName: 'Jane Roe', accountNo: '9876543210', ifsc: 'SBIN0005678', bankName: 'State Bank of India' },
    create: { partnerId: jane.id, accountName: 'Jane Roe', accountNo: '9876543210', ifsc: 'SBIN0005678', bankName: 'State Bank of India' },
  });

  // Backfill loginId for all partners without one
  const partners = await prisma.partner.findMany({ select: { id: true, name: true, loginId: true } });
  const prefixToMax: Record<string, number> = {};
  const getPrefix = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'X';
    const last = (parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'X')[0] || 'X';
    return (first + last).toUpperCase();
  };
  for (const p of partners) {
    if (p.loginId) {
      const prefix = p.loginId.slice(0, 2);
      const num = parseInt(p.loginId.slice(2), 10);
      if (!Number.isNaN(num)) prefixToMax[prefix] = Math.max(prefixToMax[prefix] || 0, num);
    }
  }
  for (const p of partners) {
    if (!p.loginId) {
      const prefix = getPrefix(p.name);
      const next = ( (prefixToMax[prefix] || 0) + 1 );
      prefixToMax[prefix] = next;
      const loginId = `${prefix}${next.toString().padStart(6, '0')}`;
      await prisma.partner.update({ where: { id: p.id }, data: { loginId } });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


