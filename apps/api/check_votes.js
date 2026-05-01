const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const votes = await p.listVote.findMany({
    where: { listId: 'cmoh8ecws0006b1gs0uzpg14y' },
    select: { id: true, voterFingerprint: true, direction: true }
  });
  console.log(JSON.stringify(votes));
  await p.$disconnect();
})();
