import { PrismaClient, ContentStatus, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  { name: '写作助手', slug: 'writing', icon: '✍️', sortOrder: 1 },
  { name: '代码生成', slug: 'coding', icon: '💻', sortOrder: 2 },
  { name: '数据分析', slug: 'data-analysis', icon: '📊', sortOrder: 3 },
  { name: '设计创意', slug: 'design', icon: '🎨', sortOrder: 4 },
  { name: '营销文案', slug: 'marketing', icon: '📢', sortOrder: 5 },
];

const tags = [
  { name: 'ChatGPT', slug: 'chatgpt' },
  { name: 'Claude', slug: 'claude' },
  { name: '效率工具', slug: 'productivity' },
  { name: '自动化', slug: 'automation' },
  { name: '创意', slug: 'creative' },
];

async function main() {
  console.log('开始填充种子数据...');

  // 创建分类
  console.log('创建分类...');
  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    createdCategories.push(created);
  }
  console.log(`✅ 创建了 ${createdCategories.length} 个分类`);

  // 创建标签
  console.log('创建标签...');
  const createdTags = [];
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
    createdTags.push(created);
  }
  console.log(`✅ 创建了 ${createdTags.length} 个标签`);

  // 创建测试用户
  console.log('创建测试用户...');
  const hashedPassword = await hash('Test123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@supermart.com' },
    update: {},
    create: {
      email: 'admin@supermart.com',
      name: '管理员',
      password: hashedPassword,
      role: UserRole.ADMIN,
      bio: 'SuperMart 平台管理员',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@supermart.com' },
    update: {},
    create: {
      email: 'user@supermart.com',
      name: '测试用户',
      password: hashedPassword,
      role: UserRole.USER,
      bio: '这是一个测试账号',
    },
  });
  console.log('✅ 创建了 2 个用户');

  // 创建示例内容
  console.log('创建示例内容...');

  // 内容1: 专业博客文章写作助手
  const content1 = await prisma.content.create({
    data: {
      name: '专业博客文章写作助手',
      description: '帮助您快速生成高质量、SEO友好的博客文章。支持多种风格和主题，适合内容创作者和营销人员。',
      version: 'v1.0.0',
      content: `# 专业博客文章写作助手

你是一位专业的博客文章写作助手。请根据用户提供的主题，生成结构清晰、内容丰富的博客文章。

## When to Use This Skill

- 需要快速产出高质量博客文章
- 想要 SEO 友好的内容结构
- 需要多种写作风格和主题支持
- 内容创作者和营销人员的日常写作

## 写作要求

1. 标题要吸引人，包含关键词
2. 开头要有一个引人入胜的引言
3. 正文分为3-5个小节，每节有小标题
4. 结尾要有总结和行动号召
5. 适当使用列表、引用等格式增强可读性

## How to Use

### Step 1: 复制指令

将上述写作要求复制到 AI 对话框中。

### Step 2: 输入主题

输入您想写的文章主题，例如："写一篇关于远程工作效率提升的文章"

### Step 3: 调整输出

根据需要调整文章长度、风格和重点。

## Examples

**输入示例**：写一篇关于"远程工作效率提升"的文章

**输出示例**：

\`\`\`
# 远程工作效率提升的10个实用技巧

远程工作已经成为新常态，但很多人发现在家办公比在办公室更难保持高效...

## 1. 创建专属工作空间
...

## 2. 制定清晰的工作时间表
...

## 总结
掌握这些技巧，让你的远程工作效率翻倍！
\`\`\`

## Tips

- 提供越详细的主题背景，输出越精准
- 可以指定目标受众和文章长度
- 建议分段生成，便于控制质量
`,
      categoryId: createdCategories[0].id, // 写作助手
      authorId: admin.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      isFeatured: true,
      viewCount: 156,
      avgRating: 4.5,
      ratingCount: 12,
    },
  });

  // 关联标签
  await prisma.contentTag.createMany({
    data: [
      { contentId: content1.id, tagId: createdTags[0].id }, // ChatGPT
      { contentId: content1.id, tagId: createdTags[2].id }, // 效率工具
    ],
  });

  // 内容2: 代码审查助手
  const content2 = await prisma.content.create({
    data: {
      name: '代码审查助手',
      description: '自动审查代码，发现潜在问题，提供改进建议。支持多种编程语言。',
      content: `# 代码审查助手

你是一位经验丰富的代码审查专家。请审查用户提交的代码，从以下方面给出反馈。

## When to Use This Skill

- 提交代码前的自我审查
- 团队 Code Review 辅助
- 学习代码最佳实践
- 发现潜在的安全漏洞

## 审查要点

1. **代码质量**：命名规范、代码结构、可读性
2. **潜在问题**：bug、安全漏洞、性能问题
3. **最佳实践**：设计模式、SOLID原则
4. **改进建议**：具体的优化方案

## How to Use

### Step 1: 准备代码

将需要审查的代码复制好。

### Step 2: 提交审查

发送代码并说明审查重点，例如：
\`\`\`
请审查这段 Python 代码，重点关注性能和安全性：
[粘贴代码]
\`\`\`

### Step 3: 应用建议

根据反馈修改代码。

## Examples

**输入**：
\`\`\`python
def get_user(id):
    query = f"SELECT * FROM users WHERE id = {id}"
    return db.execute(query)
\`\`\`

**输出**：
\`\`\`
🔴 安全问题：SQL 注入漏洞
建议使用参数化查询：
def get_user(id):
    query = "SELECT * FROM users WHERE id = ?"
    return db.execute(query, (id,))
\`\`\`

## Tips

- 一次提交的代码不要超过 100 行，便于详细分析
- 说明编程语言和项目背景
- 可以指定审查重点（性能/安全/可读性）
`,
      categoryId: createdCategories[1].id, // 代码生成
      authorId: admin.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      viewCount: 89,
      avgRating: 4.8,
      ratingCount: 8,
    },
  });

  await prisma.contentTag.createMany({
    data: [
      { contentId: content2.id, tagId: createdTags[1].id }, // Claude
      { contentId: content2.id, tagId: createdTags[3].id }, // 自动化
    ],
  });

  // 内容3: 营销文案生成器
  const content3 = await prisma.content.create({
    data: {
      name: '营销文案生成器',
      description: '快速生成吸引人的营销文案，适用于社交媒体、广告、邮件等场景。',
      content: `# 营销文案生成器

你是一位资深营销文案专家。根据用户需求，创作有说服力的营销文案。

## When to Use This Skill

- 社交媒体内容创作
- 广告文案撰写
- 营销邮件编写
- 产品描述优化

## 文案原则

1. **AIDA模型**：注意→兴趣→欲望→行动
2. **痛点驱动**：直击用户痛点
3. **利益导向**：强调用户获益
4. **行动号召**：明确的下一步

## How to Use

### Step 1: 说明需求

描述产品/服务和目标受众：
\`\`\`
产品：智能手表
受众：25-35岁职场人士
场景：朋友圈广告
\`\`\`

### Step 2: 选择风格

指定文案风格（幽默/专业/感性）

### Step 3: 优化迭代

根据初稿进行调整和优化。

## Examples

**输入**：为一款减肥茶写小红书种草文案

**输出**：
\`\`\`
姐妹们！这个减肥茶真的绝了！😱

坚持喝了2周，裤子松了一个号！
不用节食，不用运动，每天一杯就完事～

🍵 纯植物配方，0副作用
💰 一杯不到3块钱
⏰ 30天无效全额退款

趁活动价赶紧冲！戳评论区链接👇
#减肥 #瘦身 #好物分享
\`\`\`

## Tips

- 了解目标平台的风格（小红书 vs 知乎）
- 加入适当的表情符号增加亲和力
- 包含明确的行动号召（CTA）
`,
      categoryId: createdCategories[4].id, // 营销文案
      authorId: admin.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      viewCount: 234,
      avgRating: 4.6,
      ratingCount: 15,
      isFeatured: true,
    },
  });

  await prisma.contentTag.createMany({
    data: [
      { contentId: content3.id, tagId: createdTags[0].id }, // ChatGPT
      { contentId: content3.id, tagId: createdTags[4].id }, // 创意
    ],
  });

  // 内容4: 设计灵感生成
  const content4 = await prisma.content.create({
    data: {
      name: '设计灵感生成器',
      description: '为设计师提供创意灵感和设计方向建议。',
      content: `# 设计灵感生成器

你是一位资深设计师，擅长提供设计灵感和创意建议。

## When to Use This Skill

- 设计项目初期寻找灵感
- 创意枯竭时需要新思路
- 需要配色和布局建议
- 了解最新设计趋势

## 输出内容

1. **设计风格建议**：适合的整体风格
2. **配色方案**：主色、辅助色、点缀色
3. **布局参考**：视觉层次和结构
4. **灵感来源**：相关案例和参考

## How to Use

### Step 1: 描述项目

说明设计需求：
\`\`\`
设计一个科技公司的官网首页
风格：简约现代
行业：人工智能
\`\`\`

### Step 2: 指定约束

说明限制条件（颜色偏好、竞品参考等）

### Step 3: 深入探索

对感兴趣的方向进行深入讨论。

## Tips

- 提供越多的项目背景，建议越精准
- 可以要求生成 Midjourney/Stable Diffusion 提示词
- 结合实际案例一起讨论效果更好
`,
      categoryId: createdCategories[3].id, // 设计创意
      authorId: user.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      viewCount: 45,
      avgRating: 4.0,
      ratingCount: 3,
    },
  });

  console.log('✅ 创建了 4 条内容');

  // 创建评论
  await prisma.comment.createMany({
    data: [
      {
        contentId: content1.id,
        userId: user.id,
        body: '非常实用的写作助手！帮我节省了很多时间。',
      },
      {
        contentId: content1.id,
        userId: admin.id,
        body: '感谢使用，欢迎提出改进建议！',
      },
      {
        contentId: content3.id,
        userId: user.id,
        body: '营销文案生成效果很好，推荐！',
      },
    ],
  });
  console.log('✅ 创建了评论');

  // 创建评分
  await prisma.rating.createMany({
    data: [
      { contentId: content1.id, userId: user.id, score: 5 },
      { contentId: content2.id, userId: user.id, score: 5 },
      { contentId: content3.id, userId: admin.id, score: 4 },
      { contentId: content4.id, userId: user.id, score: 5 },
    ],
  });
  console.log('✅ 创建了评分');

  // 创建收藏
  await prisma.collection.createMany({
    data: [
      { userId: user.id, contentId: content1.id },
      { userId: user.id, contentId: content3.id },
      { userId: admin.id, contentId: content2.id },
    ],
  });
  console.log('✅ 创建了收藏');

  console.log('\n🎉 种子数据填充完成！');
  console.log('\n📝 测试账号信息：');
  console.log('  管理员: admin@supermart.com / Test123456');
  console.log('  用户: user@supermart.com / Test123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
