const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const testLists = await p.list.count({
    where: { OR: [{ title: { contains: '测试' } }, { title: { contains: '验证' } }] }
  });
  const testUsers = await p.user.count({
    where: { handle: { contains: 'test' } }
  });
  const totalLists = await p.list.count();
  const totalUsers = await p.user.count();
  
  console.log('DB stats:', totalLists, 'lists,', totalUsers, 'users');
  console.log('Test contamination:', testLists, 'test lists,', testUsers, 'test users');
  console.log(testLists === 0 && testUsers === 0 ? 'DB CLEAN' : 'STILL CONTAMINATED');
  
  const top = await p.list.findMany({
    orderBy: [{ upvoteCount: 'desc' }, { viewCount: 'desc' }],
    take: 3,
    select: { title: true, upvoteCount: true, viewCount: true }
  });
  console.log('\nTop 3:');
  top.forEach((l, i) => console.log('  ' + (i+1) + '. ' + l.title + ' (votes:' + l.upvoteCount + ', views:' + l.viewCount + ')'));
  
  await p.$disconnect();
})();
