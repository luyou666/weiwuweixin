const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function cleanup() {
  await p.communityScore.deleteMany({ where: { voterFingerprint: { startsWith: 'curl-device-' } } });
  await p.item.deleteMany({ where: { name: { startsWith: 'curl-test-item-' } } });
  await p.list.deleteMany({ where: { title: { startsWith: 'curl-test-' } } });
  console.log('Cleaned');
  await p.$disconnect();
}
cleanup().catch(e => { console.error(e.message); p.$disconnect(); });