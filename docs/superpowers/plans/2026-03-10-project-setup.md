# SuperMart 项目初始化和基础设施

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 初始化 Next.js 15 项目，配置 Prisma、Redis、Auth.js，建立项目基础结构

**Architecture:** Next.js 15 App Router 全栈应用，使用 Server Actions 处理 API 逻辑，Prisma 作为 ORM，Redis 做缓存

**Tech Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL, Redis (Upstash), Auth.js, Tailwind CSS, shadcn/ui

---

## File Structure

```
supermart/
├── app/                      # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                   # shadcn/ui 组件
│   └── common/               # 通用业务组件
├── lib/
│   ├── prisma.ts            # Prisma 客户端单例
│   ├── redis.ts             # Redis 客户端
│   ├── auth.ts              # Auth.js 配置
│   ├── utils.ts             # 工具函数
│   └── constants.ts         # 常量
├── types/                    # 类型定义（已存在）
├── validators/               # 验证规则（已存在）
├── prisma/
│   └── schema.prisma        # 数据库模型（已存在）
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd /home/sunxing/code/claude_workspace/supermart
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

选择：
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No (我们使用根目录的 app/)
- App Router: Yes
- Turbopack: Yes
- Import alias: @/*

Expected: 项目初始化成功

- [ ] **Step 2: 安装核心依赖**

```bash
npm install prisma @prisma/client
npm install @auth/core @auth/prisma-adapter next-auth@beta
npm install @upstash/redis
npm install zod
npm install -D @types/node
```

Expected: 依赖安装成功

- [ ] **Step 3: 安装 shadcn/ui**

```bash
npx shadcn@latest init
```

选择：
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Expected: shadcn/ui 初始化成功

- [ ] **Step 4: 安装常用 shadcn/ui 组件**

```bash
npx shadcn@latest add button input label card form toast dialog dropdown-menu select tabs badge avatar separator skeleton
```

Expected: 组件安装成功

- [ ] **Step 5: 提交项目初始化**

```bash
git init
echo "node_modules/" >> .gitignore
echo ".env.local" >> .gitignore
git add .
git commit -m "chore: initialize Next.js 15 project with dependencies"
```

Expected: 初始提交完成

---

## Task 2: 配置 Prisma 数据库

**Files:**
- Modify: `prisma/schema.prisma` (已存在，需调整)
- Create: `lib/prisma.ts`
- Create: `.env.example`

- [ ] **Step 1: 移动 prisma schema 到正确位置**

当前 schema 在 `prisma/schema.prisma`，检查是否需要调整格式。

- [ ] **Step 2: 创建 Prisma 客户端单例**

Create: `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

- [ ] **Step 3: 创建环境变量示例文件**

Create: `.env.example`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/supermart?schema=public"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Auth.js
AUTH_SECRET="your-super-secret-key-at-least-32-characters"

# File Storage (Cloudflare R2)
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="supermart"
R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://files.supermart.com"
```

- [ ] **Step 4: 创建本地环境变量文件**

Create: `.env.local` (用户需要填写真实值)

- [ ] **Step 5: 生成 Prisma 客户端**

```bash
npx prisma generate
```

Expected: Prisma 客户端生成成功

- [ ] **Step 6: 提交 Prisma 配置**

```bash
git add lib/prisma.ts .env.example prisma/
git commit -m "feat: configure Prisma with database schema"
```

---

## Task 3: 配置 Redis 客户端

**Files:**
- Create: `lib/redis.ts`

- [ ] **Step 1: 创建 Redis 客户端**

Create: `lib/redis.ts`

```typescript
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

// 缓存辅助函数
export async function cache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 默认 5 分钟
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// 缓存失效
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

- [ ] **Step 2: 提交 Redis 配置**

```bash
git add lib/redis.ts
git commit -m "feat: add Redis client with cache helpers"
```

---

## Task 4: 配置 Auth.js

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Modify: `prisma/schema.prisma` (添加 Account, Session, VerificationToken 表)

- [ ] **Step 1: 更新 Prisma schema 添加认证表**

在 `prisma/schema.prisma` 末尾添加：

```prisma
// ============================================
// Auth.js 认证表
// ============================================

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

同时在 User model 中添加关联：

```prisma
model User {
  // ... 现有字段 ...
  accounts    Account[]
  sessions    Session[]
}
```

- [ ] **Step 2: 创建 Auth.js 配置**

Create: `lib/auth.ts`

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
```

- [ ] **Step 3: 安装 bcrypt**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 4: 更新 User model 添加 password 字段**

在 `prisma/schema.prisma` 的 User model 中添加：

```prisma
model User {
  // ... 现有字段 ...
  password  String?   // 密码（Credentials 登录）
  // ... 现有关联 ...
}
```

- [ ] **Step 5: 创建 API 路由**

Create: `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 6: 创建类型声明**

Create: `types/next-auth.d.ts`

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }
  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
```

- [ ] **Step 7: 运行数据库迁移**

```bash
npx prisma migrate dev --name init
```

Expected: 迁移成功创建

- [ ] **Step 8: 提交 Auth.js 配置**

```bash
git add lib/auth.ts app/api/auth/ types/next-auth.d.ts prisma/
git commit -m "feat: configure Auth.js with credentials provider"
```

---

## Task 5: 创建基础布局和工具函数

**Files:**
- Create: `lib/utils.ts`
- Create: `lib/constants.ts`
- Create: `components/common/Header.tsx`
- Create: `components/common/Footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: 创建工具函数**

Create: `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(d);
  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 2: 安装 clsx 和 tailwind-merge**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: 创建常量文件**

Create: `lib/constants.ts`

```typescript
// 内容类型
export const CONTENT_TYPES = {
  SKILL: 'SKILL',
  AGENT: 'AGENT',
} as const;

// 内容状态
export const CONTENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

// 用户角色
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

// 分类（预设）
export const DEFAULT_CATEGORIES = [
  { name: '软件开发', slug: 'software-dev', icon: 'code' },
  { name: '建筑设计', slug: 'architecture', icon: 'building' },
  { name: '法律服务', slug: 'legal', icon: 'scale' },
  { name: '设计创意', slug: 'design', icon: 'palette' },
  { name: '社媒运营', slug: 'social-media', icon: 'share' },
];

// 排序选项
export const SORT_OPTIONS = [
  { value: 'latest', label: '最新发布' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'rating', label: '评分最高' },
] as const;

// 分页
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
```

- [ ] **Step 4: 创建 Header 组件**

Create: `components/common/Header.tsx`

```tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          SuperMart
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-sm hover:text-primary">
            探索
          </Link>
          <Link href="/create" className="text-sm hover:text-primary">
            创建
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  个人中心
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => authClient.signOut()}
              >
                登出
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">登录</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: 创建 auth-client**

Create: `lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});
```

- [ ] **Step 6: 安装 better-auth**

```bash
npm install better-auth
```

- [ ] **Step 7: 创建 Footer 组件**

Create: `components/common/Footer.tsx`

```tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 SuperMart. 保留所有权利。
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">
              关于我们
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              使用条款
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              隐私政策
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: 更新根布局**

Modify: `app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SuperMart - 国内垂类AI工具平台',
  description: '让专业从业者分享实战经验，让行业知识规模化复用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 9: 安装 sonner**

```bash
npx shadcn@latest add sonner
```

- [ ] **Step 10: 提交基础布局**

```bash
git add lib/utils.ts lib/constants.ts lib/auth-client.ts components/common/ app/layout.tsx
git commit -m "feat: add base layout with Header and Footer"
```

---

## Task 6: 创建数据库种子数据

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: 创建种子脚本**

Create: `prisma/seed.ts`

```typescript
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
```

- [ ] **Step 2: 配置 seed 脚本**

在 `package.json` 中添加：

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

- [ ] **Step 3: 安装 tsx**

```bash
npm install -D tsx
```

- [ ] **Step 4: 运行种子脚本**

```bash
npm run db:seed
```

Expected: 种子数据创建成功

- [ ] **Step 5: 提交种子脚本**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add database seed script"
```

---

## Checkpoint: 验证基础设施

- [ ] **验证 Prisma 连接**

```bash
npx prisma studio
```

Expected: 打开数据库管理界面，可以看到表和数据

- [ ] **验证开发服务器**

```bash
npm run dev
```

Expected: 服务器启动，访问 http://localhost:3000 可以看到页面

---

## Summary

完成本计划后，你将拥有：

✅ 初始化的 Next.js 15 项目
✅ 配置好的 Prisma + PostgreSQL
✅ Redis 缓存客户端
✅ Auth.js 认证系统
✅ 基础布局组件
✅ 数据库种子数据

**下一步**: 实现用户认证页面（注册/登录）
