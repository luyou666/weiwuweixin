
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const scores = await p.communityScore.findMany({
    where: { listId: 'cmodms3sk0007aw8hraiza16x' },
    select: { voterFingerprint: true, value: true, confidence: true, userId: true }
  });
  console.log('CommunityScore records:');
  console.log(JSON.stringify(scores, null, 2));
  await p.$disconnect();
})();
