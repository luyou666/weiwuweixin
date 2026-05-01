const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const testLists = await p.list.findMany({
    where: {
      OR: [
        { title: { contains: '测试' } },
        { title: { contains: '验证' } },
        { slug: { contains: 'test' } },
      ]
    },
    select: { id: true, title: true, slug: true }
  });
  console.log('Test lists:', testLists.length);
  testLists.forEach(l => console.log('  ', l.id, l.title));
  
  // Also check for test users/handles
  const testUsers = await p.user.findMany({
    where: { handle: { contains: 'test' } },
    select: { id: true, handle: true }
  });
  console.log('Test users:', testUsers.length);
  testUsers.forEach(u => console.log('  ', u.id, u.handle));
  
  await p.$disconnect();
})();
