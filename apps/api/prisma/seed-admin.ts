/**
 * 围物为心 — 管理员账号初始化脚本
 *
 * 运行方式: tsx prisma/seed-admin.ts
 *
 * 通过环境变量 ADMIN_EMAIL 和 ADMIN_PASSWORD 创建/更新管理员账号。
 * 如果管理员已存在，更新密码并确保角色为 ADMIN。
 *
 * 环境变量:
 *   ADMIN_EMAIL    — 管理员邮箱（必需）
 *   ADMIN_PASSWORD — 管理员密码（必需）
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_HANDLE = 'admin';
const ADMIN_NICKNAME = '管理员';
const SALT_ROUNDS = 12;

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ 请设置环境变量 ADMIN_EMAIL 和 ADMIN_PASSWORD');
    console.error('   示例: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword tsx prisma/seed-admin.ts');
    process.exit(1);
  }

  console.log('🔐 初始化管理员账号...\n');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  // 检查是否已有 admin handle 的 user
  let adminUser = await prisma.user.findUnique({
    where: { handle: ADMIN_HANDLE },
  });

  if (adminUser) {
    // 确保角色是 ADMIN
    if (adminUser.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'ADMIN' },
      });
      console.log('  🔄 已将现有 admin 用户角色更新为 ADMIN');
    }

    // 更新或创建 Account
    const existingAccount = await prisma.account.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { passwordHash },
      });
      console.log('  🔄 已更新管理员密码');
    } else {
      await prisma.account.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash,
          userId: adminUser.id,
        },
      });
      console.log('  🔄 已为 admin 用户创建登录账号');
    }
  } else {
    // 创建新用户 + Account
    adminUser = await prisma.user.create({
      data: {
        handle: ADMIN_HANDLE,
        nickname: ADMIN_NICKNAME,
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        account: {
          create: {
            email: ADMIN_EMAIL,
            passwordHash,
          },
        },
      },
    });
    console.log('  ✅ 已创建管理员用户');
  }

  console.log('\n📋 管理员账号信息:');
  console.log(`  邮箱: ${ADMIN_EMAIL}`);
  console.log(`  角色: ADMIN`);
  console.log(`  Handle: ${ADMIN_HANDLE}`);
  console.log('\n✅ 管理员账号初始化完成！');
}

seedAdmin()
  .catch((e) => {
    console.error('❌ 管理员账号初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
