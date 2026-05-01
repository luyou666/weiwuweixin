const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const testUsers = await p.user.findMany({
    where: { handle: { contains: 'test' } },
    select: { id: true, handle: true }
  });
  
  console.log('Test users to clean:', testUsers.length);
  for (const u of testUsers) {
    try {
      console.log(`  Cleaning: ${u.handle}`);
      await p.account.deleteMany({ where: { userId: u.id } });
      await p.rapport.deleteMany({ where: { OR: [{ userId: u.id }, { targetUserId: u.id }] } });
      await p.badge.deleteMany({ where: { userId: u.id } });
      await p.listVote.deleteMany({ where: { voterFingerprint: { contains: 'test' } } });
      await p.user.delete({ where: { id: u.id } });
    } catch(e) {
      console.log(`  Error cleaning ${u.handle}:`, e.message?.split('\n')[0]);
    }
  }
  
  console.log('Done!');
  await p.$disconnect();
})();
