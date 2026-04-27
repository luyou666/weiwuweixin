
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  // Delete all community scores for our test list
  const del = await p.communityScore.deleteMany({ where: { listId: 'cmodms3sk0007aw8hraiza16x' } });
  console.log('Deleted', del.count, 'community scores');
  
  // Reset voteCount
  await p.list.update({ where: { id: 'cmodms3sk0007aw8hraiza16x' }, data: { voteCount: 0 } });
  console.log('Reset voteCount to 0');
  
  await p.$disconnect();
})();
