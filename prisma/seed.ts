import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: '软件开发', slug: 'software-dev', icon: 'code', sortOrder: 1 },
  { name: '建筑设计', slug: 'architecture', icon: 'building', sortOrder: 2 },
  { name: '法律服务', slug: 'legal', icon: 'scale', sortOrder: 3 },
  { name: '设计创意', slug: 'design', icon: 'palette', sortOrder: 4 },
  { name: '社媒运营', slug: 'social-media', icon: 'share', sortOrder: 5 },
];

async function main() {
  console.log('开始种子数据...');

  // 创建分类
  console.log('创建分类...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // 创建测试用户
  console.log('创建测试用户...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@supermart.com' },
    update: {},
    create: {
      email: 'test@supermart.com',
      name: '测试用户',
      password: hashedPassword,
      role: 'USER',
    },
  });

  // 创建管理员
  const admin = await prisma.user.upsert({
    where: { email: 'admin@supermart.com' },
    update: {},
    create: {
      email: 'admin@supermart.com',
      name: '管理员',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('种子数据完成！');
  console.log('测试用户: test@supermart.com / password123');
  console.log('管理员: admin@supermart.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
