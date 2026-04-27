const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRaw`SELECT 1`.then(r => {
  console.log('✅ PG 连接成功:', r);
  return prisma.$disconnect();
}).catch(e => {
  console.error('❌ PG 连接失败:', e.message);
  process.exit(1);
});