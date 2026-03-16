# SuperMart 技术设计文档

> **文档版本**: v1.0
> **创建日期**: 2024-03-13
> **作者**: Tech Team
> **状态**: Draft

---

## 目录

1. [系统架构](#1-系统架构)
2. [模块设计](#2-模块设计)
3. [API 接口定义](#3-api-接口定义)
4. [数据库设计](#4-数据库设计)
5. [非功能设计](#5-非功能设计)
6. [开发排期与风险评估](#6-开发排期与风险评估)

---

## 1. 系统架构

### 1.1 技术选型

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Next.js | 15.x | App Router，全栈框架 |
| 语言 | TypeScript | 5.x | 类型安全 |
| UI 框架 | Tailwind CSS | 3.x | 原子化 CSS |
| 组件库 | shadcn/ui | latest | 基于 Radix UI |
| ORM | Prisma | 5.x | 数据库操作 |
| 数据库 | PostgreSQL | 15.x | Supabase 托管 |
| 缓存 | Redis | 7.x | Upstash 托管 |
| 认证 | NextAuth.js | 5.x | OAuth + Credentials |
| 文件存储 | Cloudflare R2 | - | 对象存储 |
| AI 服务 | Anthropic API | - | Claude 模型 |
| 部署 | Vercel | - | Serverless |

### 1.2 架构分层图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  React Components (Server/Client)                               │   │
│  │  - 首页、详情页、上传页、个人中心                                   │   │
│  │  - 交互组件：评论、评分、收藏                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP/HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                                │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │  Page Components            │  │  Server Actions                  │  │
│  │  - app/page.tsx             │  │  - app/actions/content.ts       │  │
│  │  - app/content/[id]/page.tsx│  │  - app/actions/user.ts          │  │
│  │  - app/create/page.tsx      │  │  - app/actions/interaction.ts   │  │
│  │  - app/profile/page.tsx     │  │  - 表单验证、权限检查             │  │
│  └─────────────────────────────┘  └─────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Application Layer                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Services (业务逻辑)                                               │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐  │ │
│  │  │ContentService│ │ UserService  │ │ InteractionService       │  │ │
│  │  │- CRUD        │ │- 认证管理    │ │- 评论、评分、收藏         │  │ │
│  │  │- 搜索        │ │- 个人信息    │ │- 统计计算                │  │ │
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘  │ │
│  │  ┌──────────────┐ ┌──────────────────────────────────────────┐   │ │
│  │  │ AIService    │ │ FileService                              │   │ │
│  │  │- 简介生成    │ │- ZIP 解析、文件上传、R2 存储              │   │ │
│  │  │- 安全报告    │ │                                          │   │ │
│  │  └──────────────┘ └──────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Infrastructure Layer                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Prisma      │ │  Redis       │ │  R2 Storage  │ │  Claude API  │  │
│  │  (PostgreSQL)│ │  (Upstash)   │ │  (Cloudflare)│ │  (Anthropic) │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 部署架构

```
                         ┌─────────────────┐
                         │     用户        │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │     Cloudflare CDN      │
                    │     (DNS + WAF)         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       Vercel            │
                    │  ┌───────────────────┐  │
                    │  │  Next.js App      │  │
                    │  │  (Edge Runtime)   │  │
                    │  └───────────────────┘  │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Supabase     │    │    Upstash      │    │  Cloudflare R2  │
│   (PostgreSQL)  │    │    (Redis)      │    │  (File Storage) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 2. 模块设计

### 2.0 模块总览

系统采用分层架构，各层职责清晰分离：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              模块层次关系                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     页面层 (Pages)                                   │   │
│   │   app/page.tsx, app/(main)/*, app/(auth)/*                          │   │
│   │   职责: 页面组装、数据获取、SEO 元数据                                │   │
│   └────────────────────────────────┬────────────────────────────────────┘   │
│                                    │ 调用                                    │
│   ┌────────────────────────────────▼────────────────────────────────────┐   │
│   │                     组件层 (Components)                              │   │
│   │   components/content/*, components/auth/*, components/interaction/*  │   │
│   │   职责: UI 渲染、用户交互、表单状态管理                               │   │
│   └────────────────────────────────┬────────────────────────────────────┘   │
│                                    │ 调用                                    │
│   ┌────────────────────────────────▼────────────────────────────────────┐   │
│   │                  Server Actions 层 (API 入口)                        │   │
│   │   app/actions/content.ts, auth.ts, interaction.ts, user.ts, meta.ts  │   │
│   │   职责: 参数验证、权限检查、调用服务层、缓存失效                       │   │
│   └────────────────────────────────┬────────────────────────────────────┘   │
│                                    │ 调用                                    │
│   ┌────────────────────────────────▼────────────────────────────────────┐   │
│   │                     服务层 (Services)                                │   │
│   │   services/content.service.ts, (future: ai, file, interaction)       │   │
│   │   职责: 业务逻辑封装、数据组装、缓存管理、事务控制                     │   │
│   └────────────────────────────────┬────────────────────────────────────┘   │
│                                    │ 调用                                    │
│   ┌────────────────────────────────▼────────────────────────────────────┐   │
│   │                   基础设施层 (Infrastructure)                        │   │
│   │   lib/prisma.ts, lib/redis.ts, lib/auth.ts                          │   │
│   │   职责: 数据库连接、缓存客户端、认证配置                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 页面模块

```
app/
├── (auth)/                          # 认证页面组 (共享布局)
│   ├── layout.tsx                   # 认证布局 (无 Header/Footer)
│   ├── login/page.tsx               # 登录页
│   ├── register/page.tsx            # 注册页
│   └── profile/
│       ├── page.tsx                 # 个人中心 - 信息展示/编辑
│       └── contents/page.tsx        # 个人中心 - 我的内容/收藏
│
├── (main)/                          # 主站页面组 (共享布局)
│   ├── page.tsx                     # 首页 (Hero + 分类 + 内容列表)
│   ├── explore/page.tsx             # 浏览/搜索页 (筛选 + 列表)
│   ├── content/[id]/page.tsx        # 内容详情页
│   ├── create/page.tsx              # 创建内容页
│   └── edit/[id]/page.tsx           # 编辑内容页
│
├── layout.tsx                       # 根布局 (全局 Provider)
└── globals.css                      # 全局样式
```

#### 页面职责说明

| 页面 | 路由 | 职责 | 数据获取方式 |
|------|------|------|-------------|
| 首页 | `/` | 展示平台介绍、分类导航、精选/最新/热门内容 | Server Component 直接调用 |
| 浏览 | `/explore` | 内容搜索、分类筛选、排序 | Server Component + 客户端筛选 |
| 详情 | `/content/[id]` | 内容详情、评论、评分、收藏 | Server Component 动态渲染 |
| 创建 | `/create` | 创建 Skill/Agent 内容 | Client Component + Server Actions |
| 编辑 | `/edit/[id]` | 编辑已有内容 | Client Component + Server Actions |
| 登录 | `/login` | 邮箱/OAuth 登录 | Client Component |
| 注册 | `/register` | 邮箱注册 | Client Component + Server Actions |
| 个人中心 | `/profile` | 用户信息展示与编辑 | Server Component + 客户端表单 |

### 2.2 组件模块

```
components/
├── ui/                              # shadcn/ui 基础组件 (无业务逻辑)
│   ├── button.tsx                   # 按钮
│   ├── input.tsx                    # 输入框
│   ├── textarea.tsx                 # 多行文本
│   ├── select.tsx                   # 下拉选择
│   ├── card.tsx                     # 卡片容器
│   ├── badge.tsx                    # 标签
│   ├── avatar.tsx                   # 头像
│   ├── tabs.tsx                     # 标签页
│   ├── dialog.tsx                   # 对话框
│   ├── form.tsx                     # 表单 (React Hook Form)
│   ├── dropdown-menu.tsx            # 下拉菜单
│   ├── separator.tsx                # 分隔线
│   ├── skeleton.tsx                 # 骨架屏
│   └── sonner.tsx                   # Toast 通知
│
├── common/                          # 通用业务组件
│   ├── Header.tsx                   # 导航栏 (Logo + 搜索 + 用户菜单)
│   ├── Footer.tsx                   # 页脚 (链接 + 版权)
│   └── Pagination.tsx               # 分页组件 (页码切换)
│
├── content/                         # 内容相关组件
│   ├── ContentCard.tsx              # 内容卡片 (列表项展示)
│   ├── ContentList.tsx              # 内容列表容器 (网格布局)
│   ├── ContentDetail.tsx            # 内容详情主体
│   └── ContentForm.tsx              # 内容创建/编辑表单
│
├── interaction/                     # 互动相关组件
│   ├── RatingStars.tsx              # 评分星星 (1-5星选择/展示)
│   ├── CommentForm.tsx              # 评论输入表单
│   ├── CommentSection.tsx           # 评论区 (列表 + 分页)
│   └── CollectionButton.tsx         # 收藏按钮 (切换状态)
│
└── auth/                            # 认证相关组件
    ├── LoginForm.tsx                # 登录表单
    ├── RegisterForm.tsx             # 注册表单
    └── ProfileForm.tsx              # 个人信息编辑表单
```

#### 组件职责说明

| 模块 | 组件 | 类型 | 职责 |
|------|------|------|------|
| **ui/** | * | 基础 | 纯展示组件，无业务逻辑，可复用 |
| **common/Header** | Header | Client | 导航、搜索跳转、用户菜单下拉 |
| **common/Footer** | Footer | Server | 静态链接展示 |
| **common/Pagination** | Pagination | Client | 页码点击、URL 参数更新 |
| **content/ContentCard** | ContentCard | Server | 展示单个内容的卡片信息 |
| **content/ContentList** | ContentList | Server | 网格布局、遍历渲染 ContentCard |
| **content/ContentDetail** | ContentDetail | Server | 详情页主体、组合多个子组件 |
| **content/ContentForm** | ContentForm | Client | 表单验证、分类/标签选择、提交 |
| **interaction/RatingStars** | RatingStars | Client | 星星点击、调用评分 API |
| **interaction/CommentForm** | CommentForm | Client | 评论输入、字数限制、提交 |
| **interaction/CommentSection** | CommentSection | Client | 评论列表、分页加载、删除 |
| **interaction/CollectionButton** | CollectionButton | Client | 收藏切换、图标状态变化 |
| **auth/LoginForm** | LoginForm | Client | 登录表单、OAuth 按钮 |
| **auth/RegisterForm** | RegisterForm | Client | 注册表单、密码确认 |
| **auth/ProfileForm** | ProfileForm | Client | 头像上传、个人信息编辑 |

### 2.3 Server Actions 模块 (API 入口层)

Server Actions 是前后端交互的唯一入口，负责参数验证、权限检查和调用服务层。

```
app/actions/
├── content.ts                       # 内容相关操作
├── interaction.ts                   # 互动相关操作
├── auth.ts                          # 认证相关操作
├── user.ts                          # 用户相关操作
└── meta.ts                          # 元数据操作 (分类、标签)
```

#### content.ts - 内容操作

| 函数 | 权限 | 职责 |
|------|------|------|
| `getContents(params)` | 公开 | 获取内容列表，支持筛选/搜索/分页 |
| `getContent(id)` | 公开 | 获取内容详情，自动增加浏览计数 |
| `createContent(data)` | 登录 | 创建新内容，支持草稿/发布 |
| `updateContent(id, data)` | 作者 | 更新内容，验证所有权 |
| `publishContent(id)` | 作者 | 发布草稿内容 |
| `deleteContent(id)` | 作者 | 删除内容，验证所有权 |
| `getMyContents(params)` | 登录 | 获取当前用户创建的内容 |
| `getHomeData()` | 公开 | 获取首页数据 (精选/最新/热门/统计) |

#### interaction.ts - 互动操作

| 函数 | 权限 | 职责 |
|------|------|------|
| `getComments(contentId, page)` | 公开 | 获取评论列表 (分页) |
| `createComment(contentId, body)` | 登录 | 创建评论 |
| `deleteComment(id)` | 作者 | 删除评论，验证所有权 |
| `rateContent(contentId, score)` | 登录 | 创建/更新评分，重新计算平均分 |
| `getUserRating(contentId)` | 登录 | 获取当前用户的评分 |
| `toggleCollection(contentId)` | 登录 | 切换收藏状态 |
| `isCollected(contentId)` | 登录 | 检查是否已收藏 |
| `getMyCollections(params)` | 登录 | 获取当前用户的收藏列表 |

#### auth.ts - 认证操作

| 函数 | 权限 | 职责 |
|------|------|------|
| `register(email, password, name)` | 公开 | 注册新用户，自动登录 |
| `getCurrentUser()` | 登录 | 获取当前用户信息及统计 |

#### user.ts - 用户操作

| 函数 | 权限 | 职责 |
|------|------|------|
| `updateProfile(name, bio, avatar)` | 登录 | 更新个人资料 |
| `updateAIConfig(config)` | 登录 | 更新 AI 配置 (API Key 等) |

#### meta.ts - 元数据操作

| 函数 | 权限 | 职责 |
|------|------|------|
| `getCategories()` | 公开 | 获取所有分类 (含内容计数) |
| `getTags()` | 公开 | 获取所有标签 (含内容计数) |

### 2.4 服务层模块

服务层封装核心业务逻辑，被 Server Actions 调用。

```
services/
├── content.service.ts               # 内容服务 ✅ 已实现
├── interaction.service.ts           # 互动服务 ⏭️ 不需要 (逻辑在 actions 层)
├── ai.service.ts                    # AI 服务 📋 待实现
└── file.service.ts                  # 文件服务 📋 待实现
```

> **设计决策**: Interaction 逻辑相对简单（评论/评分/收藏都是单表操作），没有缓存需求，因此直接在 `actions/interaction.ts` 中实现，不抽取独立服务层。只有当逻辑复杂到需要复用时才抽取服务层。

#### ContentService - 内容服务

```typescript
export class ContentService {
  // 查询
  getList(params: GetContentsParams): Promise<PaginatedResult>  // 列表查询
  getById(id: string, userId?: string): Promise<ContentDetail>  // 详情查询
  getHomeData(): Promise<HomeData>                              // 首页聚合数据

  // 变更
  create(data: CreateContentData, authorId: string): Promise<Content>
  update(id: string, data: Partial<CreateContentData>): Promise<Content>
  delete(id: string): Promise<void>
  publish(id: string): Promise<Content>

  // 统计
  incrementViewCount(id: string): Promise<void>
  recalculateRating(contentId: string): Promise<void>
}
```

**设计原则**：
- 单例模式导出 `contentService` 实例
- 缓存管理内置在服务层 (首页数据 5 分钟缓存)
- 数据变更后自动清除相关缓存

### 2.5 基础设施层

```
lib/
├── prisma.ts                        # Prisma 客户端单例
├── redis.ts                         # Redis 客户端 + 缓存工具函数
├── auth.ts                          # NextAuth v5 配置
├── constants.ts                     # 常量定义
└── utils.ts                         # 通用工具函数 (cn 等)
```

#### 各模块职责

| 模块 | 职责 | 导出 |
|------|------|------|
| `prisma.ts` | 数据库连接管理 | `prisma` 客户端实例 |
| `redis.ts` | 缓存操作封装 | `redis` 客户端、`cache()`、`invalidateCache()` |
| `auth.ts` | 认证配置与会话管理 | `auth()` 会话获取、`signIn`、`signOut` |
| `constants.ts` | 常量定义 | `CONTENT_TYPES`、`CACHE_KEYS`、`DEFAULT_CATEGORIES` 等 |
| `utils.ts` | 通用工具 | `cn()` 类名合并等 |

### 2.6 类型与验证模块

```
types/
├── api.ts                           # 所有 API 类型定义 (381 行)
└── next-auth.d.ts                   # NextAuth 类型扩展

validators/
└── index.ts                         # 所有 Zod Schema (216 行)
```

**职责划分**：
- `types/api.ts`：所有 TypeScript 类型定义（API 响应、请求参数、业务实体）
- `validators/index.ts`：所有 Zod Schema 定义（运行时验证）

> **设计决策**: 采用单文件结构，原因是当前代码量不大（<400 行），集中管理更便于查找和维护。后续如文件增长超过 500 行，可考虑按模块拆分。

---

## 3. API 接口定义

### 3.1 Server Actions 接口

所有接口通过 Next.js Server Actions 实现，返回统一的响应格式：

```typescript
// 统一响应格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_ERROR';
  details?: Record<string, string[]>; // 表单验证错误详情
}

// 分页响应格式
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

### 3.2 内容相关 API

#### 获取内容列表

```typescript
// app/actions/content.ts - getContents

// 请求参数
interface GetContentsParams {
  type?: 'SKILL' | 'AGENT';      // 内容类型
  categoryId?: string;            // 分类 ID
  tagId?: string;                 // 标签 ID
  query?: string;                 // 搜索关键词
  sort?: 'latest' | 'popular' | 'rating' | 'downloads';  // 排序方式
  page?: number;                  // 页码，默认 1
  pageSize?: number;              // 每页数量，默认 12
}

// 响应数据
interface ContentListItem {
  id: string;
  type: 'SKILL' | 'AGENT';
  name: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  tags: Array<{ id: string; name: string }>;
  avgRating: number | null;
  ratingCount: number;
  viewCount: number;
  downloadCount: number;
  isFeatured: boolean;
  createdAt: string;
}

// 调用示例
const result = await getContents({
  category: '创作运营',
  sort: 'latest',
  page: 1,
  pageSize: 12
});
```

#### 获取内容详情

```typescript
// app/actions/content.ts - getContent

// 请求参数
id: string  // 内容 ID

// 响应数据
interface ContentDetail {
  id: string;
  type: 'SKILL' | 'AGENT';
  name: string;
  description: string;
  content: string | null;          // 完整 Markdown 内容
  toolsConfig: ToolsConfig | null; // 工具配置 JSON
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  updatedAt: string;

  author: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  tags: Array<{ id: string; name: string }>;
  files: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
  }>;

  avgRating: number | null;
  ratingCount: number;
  viewCount: number;
  downloadCount: number;
  isFeatured: boolean;
  isOwner: boolean;                // 当前用户是否为作者

  // 用户状态（需登录）
  userRating?: { score: number } | null;
  isCollected?: boolean;
}
```

#### 创建内容

```typescript
// app/actions/content.ts - createContent

// 请求参数
interface CreateContentInput {
  type: 'SKILL' | 'AGENT';
  name: string;                    // 必填，最大 100 字符
  description: string;             // 必填，AI 生成后可编辑
  categoryId: string;              // 必填
  content?: string;                // Markdown 内容
  toolsConfig?: ToolsConfig;       // 工具配置
  tagIds?: string[];               // 标签 ID 数组
  fileIds?: string[];              // 已上传文件 ID 数组
  version?: string;                // 版本号，如 v1.0.0
  versionNotes?: string;           // 版本说明
  isDraft?: boolean;               // 是否保存为草稿
}

// 响应数据
interface CreateContentOutput {
  id: string;
  name: string;
  status: string;
}
```

#### 更新内容

```typescript
// app/actions/content.ts - updateContent

// 请求参数
id: string
data: Partial<CreateContentInput>

// 响应数据
interface UpdateContentOutput {
  id: string;
  name: string;
}
```

#### 发布内容

```typescript
// app/actions/content.ts - publishContent

// 请求参数
id: string

// 响应数据
interface PublishContentOutput {
  id: string;
  status: 'PUBLISHED';
}
```

#### 删除内容

```typescript
// app/actions/content.ts - deleteContent

// 请求参数
id: string

// 响应数据
{ success: true }
```

#### 获取首页数据

```typescript
// app/actions/content.ts - getHomeData

// 响应数据
interface HomeData {
  stats: {
    totalContents: number;
    totalUsers: number;
    totalCategories: number;
  };
  categories: Array<{
    id: string;
    name: string;
    icon: string | null;
    contentsCount: number;
  }>;
  featured: ContentListItem[];     // 精选推荐，最多 6 条
  latest: ContentListItem[];       // 最新发布，最多 8 条
  popular: ContentListItem[];      // 热门内容，最多 8 条
}
```

### 3.3 用户相关 API

#### 获取当前用户

```typescript
// app/actions/user.ts - getCurrentUser

// 响应数据
interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}
```

#### 更新个人资料

```typescript
// app/actions/user.ts - updateProfile

// 请求参数
interface UpdateProfileInput {
  name?: string;      // 最大 50 字符
  avatar?: string;    // 头像 URL
  bio?: string;       // 最大 500 字符
}

// 响应数据
CurrentUser
```

#### 获取我的内容

```typescript
// app/actions/user.ts - getMyContents

// 请求参数
interface GetMyContentsParams {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  page?: number;
  pageSize?: number;
}

// 响应数据
PaginatedResponse<ContentListItem>  // 包含 status 字段
```

### 3.4 互动相关 API

#### 评论

```typescript
// app/actions/interaction.ts

// 创建评论
interface CreateCommentInput {
  contentId: string;
  body: string;          // 最大 2000 字符
  parentId?: string;     // 回复的评论 ID（可选）
}

// 获取评论列表
interface GetCommentsParams {
  contentId: string;
  page?: number;
  pageSize?: number;
}

interface CommentItem {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  likes: number;
  replies?: CommentItem[];
}

// 删除评论（仅作者可删除）
deleteComment(id: string): Promise<void>
```

#### 评分

```typescript
// app/actions/interaction.ts

// 创建或更新评分
interface CreateRatingInput {
  contentId: string;
  score: number;         // 1-5
}

interface RatingOutput {
  id: string;
  score: number;
  contentId: string;
}

// 获取用户评分
getUserRating(contentId: string): Promise<{ score: number } | null>
```

#### 收藏

```typescript
// app/actions/interaction.ts

// 切换收藏状态
toggleCollection(contentId: string): Promise<{ collected: boolean }>

// 检查是否已收藏
isCollected(contentId: string): Promise<boolean>

// 获取用户收藏列表
getUserCollections(params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<ContentListItem>>
```

### 3.5 文件相关 API

```typescript
// app/actions/file.ts

// 上传文件
interface UploadFileInput {
  file: File;            // File 对象
  type: 'skill' | 'avatar';
}

interface UploadFileOutput {
  id: string;
  url: string;
  filename: string;
  size: number;
}

// 获取下载链接
getDownloadUrl(contentId: string): Promise<{ url: string; expiresAt: string }>
```

### 3.6 AI 相关 API

```typescript
// app/actions/ai.ts

// 生成 Skill 简介
interface GenerateDescriptionInput {
  name: string;
  category: string;
  fileContent: string;    // 解析后的文件内容
}

interface GenerateDescriptionOutput {
  description: string;    // AI 生成的简介
}

// 生成安全性报告
interface GenerateSecurityReportInput {
  fileContent: string;
  fileStructure: FileNode[];
}

interface SecurityReport {
  status: 'safe' | 'warning' | 'danger';
  issues: string[];
  details: string;
}
```

---

## 4. 数据库设计

### 4.1 ER 图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              数据库 ER 图                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐       ┌───────────────────┐
│       User        │       │     Category      │
├───────────────────┤       ├───────────────────┤
│ id (PK)           │       │ id (PK)           │
│ email (UK)        │       │ name (UK)         │
│ name              │       │ slug (UK)         │
│ avatar            │       │ icon              │
│ bio               │       │ sortOrder         │
│ role              │       │ parentId (FK)     │──┐
│ password          │       └─────────┬─────────┘  │
│ aiConfig (JSON)   │                 │            │
│ createdAt         │                 │            │
│ updatedAt         │                 │            │
└─────────┬─────────┘                 │            │
          │                           │            │
          │ 1:N                       │ 1:N        │
          │                           │            │
          ▼                           ▼            │
┌─────────────────────────────────────────────────┴───────────┐│
│                         Content                              │
├─────────────────────────────────────────────────────────────┤│
│ id (PK)                                                     ││
│ type (SKILL/AGENT)                                          ││
│ name                                                        ││
│ description (TEXT)                                          ││
│ content (TEXT)                                              ││
│ toolsConfig (JSON)                                          ││
│ status (DRAFT/PUBLISHED/ARCHIVED)                           ││
│ isFeatured                                                  ││
│ viewCount                                                   ││
│ downloadCount                                               ││
│ avgRating                                                   ││
│ ratingCount                                                 ││
│ authorId (FK) ─────────────────────────> User.id            ││
│ categoryId (FK) ───────────────────────> Category.id        ││
│ createdAt                                                   ││
│ updatedAt                                                   ││
│ publishedAt                                                 ││
└───────┬─────────────────────────────────────────────────────┘│
        │                                                     │
        │ 1:N                                                 │
        ├────────────────┬────────────────┬───────────────────┤
        ▼                ▼                ▼                   │
┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│     File      │ │    Comment    │ │    Rating     │        │
├───────────────┤ ├───────────────┤ ├───────────────┤        │
│ id (PK)       │ │ id (PK)       │ │ id (PK)       │        │
│ filename      │ │ body (TEXT)   │ │ score (1-5)   │        │
│ url           │ │ contentId(FK) │ │ contentId(FK) │        │
│ type          │ │ userId (FK)   │ │ userId (FK)   │        │
│ size          │ │ createdAt     │ │ createdAt     │        │
│ contentId(FK) │ │ updatedAt     │ │ updatedAt     │        │
│ createdAt     │ └───────────────┘ └───────────────┘        │
└───────────────┘                                           │
                                                            │
┌───────────────────┐        ┌───────────────────┐          │
│       Tag         │        │   ContentTag      │          │
├───────────────────┤        ├───────────────────┤          │
│ id (PK)           │        │ contentId (FK)    │──────────┘
│ name (UK)         │<───────│ tagId (FK)        │
│ slug (UK)         │   N:N  │                   │
└───────────────────┘        └───────────────────┘

┌───────────────────┐        ┌───────────────────┐
│   Collection      │        │     Account       │
├───────────────────┤        ├───────────────────┤
│ id (PK)           │        │ id (PK)           │
│ userId (FK)       │        │ userId (FK)       │
│ contentId (FK)    │        │ provider          │
│ createdAt         │        │ providerAccountId │
│ (UK: userId+      │        │ access_token      │
│      contentId)   │        │ ...               │
└───────────────────┘        └───────────────────┘
```

### 4.2 数据表详细设计

#### users 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, cuid | 主键 |
| email | String | UK, NOT NULL | 邮箱 |
| name | String | NULLABLE | 用户名 |
| avatar | String | NULLABLE | 头像 URL |
| bio | String | NULLABLE | 个人简介 |
| role | Enum | DEFAULT 'USER' | 角色：USER/ADMIN |
| password | String | NULLABLE | 密码哈希 |
| aiConfig | JSON | NULLABLE | AI 配置 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | updatedAt | 更新时间 |

**索引**: email

#### contents 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, cuid | 主键 |
| type | Enum | NOT NULL | SKILL/AGENT |
| name | String | NOT NULL | 名称 |
| description | Text | NOT NULL | 描述 |
| content | Text | NULLABLE | Markdown 内容 |
| toolsConfig | JSON | NULLABLE | 工具配置 |
| status | Enum | DEFAULT 'DRAFT' | DRAFT/PUBLISHED/ARCHIVED |
| isFeatured | Boolean | DEFAULT false | 是否精选 |
| viewCount | Int | DEFAULT 0 | 浏览量 |
| downloadCount | Int | DEFAULT 0 | 下载量 |
| avgRating | Float | NULLABLE | 平均评分 |
| ratingCount | Int | DEFAULT 0 | 评分数 |
| authorId | String | FK -> users | 作者 ID |
| categoryId | String | FK -> categories | 分类 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | updatedAt | 更新时间 |
| publishedAt | DateTime | NULLABLE | 发布时间 |

**索引**: (type, status), categoryId, authorId, createdAt DESC, viewCount DESC, avgRating DESC

#### categories 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, cuid | 主键 |
| name | String | UK, NOT NULL | 分类名称 |
| slug | String | UK, NOT NULL | URL 标识 |
| icon | String | NULLABLE | 图标 |
| sortOrder | Int | DEFAULT 0 | 排序权重 |
| parentId | String | FK -> categories, NULLABLE | 父分类 ID |

**索引**: slug

#### comments 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, cuid | 主键 |
| body | Text | NOT NULL | 评论内容 |
| contentId | String | FK -> contents | 内容 ID |
| userId | String | FK -> users | 用户 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | updatedAt | 更新时间 |

**索引**: (contentId, createdAt DESC)

#### ratings 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, cuid | 主键 |
| score | Int | NOT NULL, CHECK(1-5) | 评分 |
| contentId | String | FK -> contents | 内容 ID |
| userId | String | FK -> users | 用户 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | updatedAt | 更新时间 |

**唯一约束**: (contentId, userId)

#### collections 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, cuid | 主键 |
| userId | String | FK -> users | 用户 ID |
| contentId | String | FK -> contents | 内容 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |

**唯一约束**: (userId, contentId)
**索引**: userId

#### files 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, cuid | 主键 |
| filename | String | NOT NULL | 原始文件名 |
| url | String | NOT NULL | 存储地址 |
| type | String | NOT NULL | MIME 类型 |
| size | Int | NOT NULL | 文件大小(字节) |
| contentId | String | FK -> contents | 内容 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |

**索引**: contentId

---

## 5. 非功能设计

### 5.1 性能要求

| 指标 | 目标值 | 实现方案 |
|------|--------|----------|
| 页面加载时间 | < 2s (P95) | 静态生成 + ISR + 边缘缓存 |
| API 响应时间 | < 500ms (P95) | Redis 缓存 + 数据库索引优化 |
| 首屏加载 (FCP) | < 1.5s | 代码分割 + 预加载关键资源 |
| 交互响应 (TTI) | < 3s | 懒加载非关键组件 |

### 5.2 缓存策略

```typescript
// Redis 缓存键设计
const CACHE_KEYS = {
  // 内容相关
  CONTENT_LIST: (params) => `content:list:${hashParams(params)}`,
  CONTENT_DETAIL: (id) => `content:detail:${id}`,
  HOME_DATA: 'home:data',

  // 用户相关
  USER_PROFILE: (id) => `user:profile:${id}`,

  // 分类
  CATEGORIES: 'categories:all',
};

// 缓存过期时间
const CACHE_TTL = {
  CONTENT_DETAIL: 300,    // 5 分钟
  CONTENT_LIST: 120,      // 2 分钟
  HOME_DATA: 300,         // 5 分钟
  USER_PROFILE: 1800,     // 30 分钟
  CATEGORIES: 3600,       // 1 小时
};
```

### 5.3 安全设计

#### 认证与授权

```
┌─────────────────────────────────────────────────────────────────┐
│                        认证流程                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  登录方式:                                                       │
│  ├── 邮箱 + 密码 (Credentials)                                  │
│  ├── GitHub OAuth                                               │
│  └── Google OAuth                                               │
│                                                                 │
│  认证方案: NextAuth.js v5                                        │
│  ├── Session Strategy: JWT                                      │
│  ├── Token 过期时间: 7 天                                        │
│  └── Cookie: HttpOnly, Secure, SameSite=Lax                    │
│                                                                 │
│  权限控制:                                                       │
│  ├── 访客: 浏览、下载                                           │
│  ├── 用户: 评论、评分、收藏、上传                                │
│  └── 管理员: 内容管理、用户管理                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 数据安全

| 安全措施 | 说明 |
|----------|------|
| 密码存储 | bcrypt 加密，cost factor >= 12 |
| SQL 注入防护 | Prisma 参数化查询 |
| XSS 防护 | React 自动转义 + DOMPurify |
| CSRF 防护 | NextAuth 内置 CSRF Token |
| 文件上传 | 类型校验 + 大小限制 + 安全扫描 |
| API Key | 环境变量存储，加密敏感字段 |

#### 文件安全

```typescript
// 文件上传限制
const FILE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024,  // 10MB
  allowedTypes: ['application/zip'],
  allowedExtensions: ['.zip'],
};

// 安全检查
async function validateFile(file: File): Promise<SecurityReport> {
  // 1. 文件类型检查
  // 2. 文件大小检查
  // 3. ZIP 结构分析
  // 4. AI 安全扫描
}
```

### 5.4 可扩展性设计

#### 架构扩展点

```
┌─────────────────────────────────────────────────────────────────┐
│                        扩展计划                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1 (当前 MVP):                                            │
│  ├── 全栈单体架构                                                │
│  └── Vercel Serverless 部署                                     │
│                                                                 │
│  Phase 2 (流量增长):                                            │
│  ├── 引入向量搜索 (Pinecone/Milvus)                             │
│  ├── 搜索服务独立                                                │
│  └── CDN 静态资源分离                                           │
│                                                                 │
│  Phase 3 (业务复杂):                                            │
│  ├── AI 服务独立 (Python 微服务)                                │
│  ├── 支付服务独立                                                │
│  └── 消息队列 (任务异步处理)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 代码扩展设计

```typescript
// AI 服务适配器模式
interface AIProvider {
  generateDescription(data: SkillData): Promise<string>;
  generateSecurityReport(content: string): Promise<SecurityReport>;
}

class AnthropicProvider implements AIProvider { ... }
class OpenAIProvider implements AIProvider { ... }

// 配置切换
const aiProvider = process.env.AI_PROVIDER === 'openai'
  ? new OpenAIProvider()
  : new AnthropicProvider();
```

---

## 6. 开发排期与风险评估

### 6.1 任务拆分

#### Sprint 1: 基础架构 (Week 1-2)

| 任务 | 优先级 | 工时 | 负责人 | 依赖 |
|------|--------|------|--------|------|
| 项目初始化 & 配置 | P0 | 0.5d | - | - |
| 数据库 Schema 设计 & 迁移 | P0 | 1d | - | - |
| 认证系统 (NextAuth) | P0 | 2d | - | - |
| 基础组件库 (shadcn/ui) | P0 | 1d | - | - |
| 布局组件 (Header/Footer) | P0 | 0.5d | - | - |
| **小计** | | **5d** | | |

#### Sprint 2: 核心功能 (Week 3-4)

| 任务 | 优先级 | 工时 | 负责人 | 依赖 |
|------|--------|------|--------|------|
| 首页 UI & 数据展示 | P0 | 2d | - | Sprint 1 |
| 内容列表 & 搜索筛选 | P0 | 2d | - | Sprint 1 |
| 内容详情页 UI | P0 | 2d | - | Sprint 1 |
| ContentService 实现 | P0 | 2d | - | Sprint 1 |
| **小计** | | **8d** | | |

#### Sprint 3: 互动功能 (Week 5-6)

| 任务 | 优先级 | 工时 | 负责人 | 依赖 |
|------|--------|------|--------|------|
| 评论系统 | P0 | 1.5d | - | Sprint 2 |
| 评分系统 | P0 | 1d | - | Sprint 2 |
| 收藏功能 | P0 | 1d | - | Sprint 2 |
| InteractionService 实现 | P0 | 1.5d | - | Sprint 2 |
| **小计** | | **5d** | | |

#### Sprint 4: 上传功能 (Week 7-8)

| 任务 | 优先级 | 工时 | 负责人 | 依赖 |
|------|--------|------|--------|------|
| 文件上传 (R2) | P0 | 1.5d | - | Sprint 1 |
| ZIP 解析 & 展示 | P0 | 1.5d | - | - |
| AI 简介生成 | P0 | 2d | - | - |
| 安全报告生成 | P1 | 1.5d | - | - |
| 上传表单 UI (4步) | P0 | 1.5d | - | Sprint 2 |
| **小计** | | **8d** | | |

#### Sprint 5: 用户中心 & 优化 (Week 9-10)

| 任务 | 优先级 | 工时 | 负责人 | 依赖 |
|------|--------|------|--------|------|
| 个人中心 UI | P0 | 1.5d | - | Sprint 2 |
| 个人信息编辑 | P0 | 1d | - | Sprint 1 |
| Redis 缓存优化 | P1 | 1.5d | - | Sprint 2 |
| SEO 优化 | P1 | 1d | - | Sprint 2 |
| 单元测试 | P1 | 2d | - | Sprint 4 |
| E2E 测试 | P2 | 1.5d | - | Sprint 4 |
| **小计** | | **8.5d** | | |

### 6.2 甘特图

```
Week:  1   2   3   4   5   6   7   8   9   10
       ├───┼───┼───┼───┼───┼───┼───┼───┼───┤
Sprint 1: 基础架构
       [█████████]
       项目初始化 / 数据库 / 认证 / 组件

Sprint 2: 核心功能
               [████████████████]
               首页 / 列表 / 详情 / Service

Sprint 3: 互动功能
                       [█████████]
                       评论 / 评分 / 收藏

Sprint 4: 上传功能
                               [████████████████]
                               上传 / AI / 安全报告

Sprint 5: 优化
                                       [████████████████]
                                       用户中心 / 缓存 / 测试
```

### 6.3 风险评估

| 风险 | 等级 | 影响 | 概率 | 应对方案 |
|------|------|------|------|----------|
| AI API 限流/故障 | 高 | 核心功能不可用 | 中 | 1. 异步队列处理 2. 重试机制 3. 降级方案(手动编辑) |
| 文件存储成本超预算 | 中 | 运营成本增加 | 中 | 1. 文件大小限制 2. CDN 缓存 3. 定期清理无用文件 |
| 数据库性能瓶颈 | 中 | 页面响应慢 | 低 | 1. Redis 缓存 2. 读写分离 3. 索引优化 |
| OAuth 登录失败 | 低 | 用户无法登录 | 低 | 1. 多登录方式备选 2. 错误提示引导 |
| 安全漏洞 | 高 | 数据泄露 | 低 | 1. 代码审查 2. 安全扫描 3. 定期更新依赖 |

### 6.4 技术债务管理

| 类型 | 说明 | 处理优先级 |
|------|------|------------|
| 测试覆盖率 | MVP 阶段测试可能不完整 | Sprint 5 补充 |
| 错误处理 | 统一错误处理机制 | Sprint 2-3 完善 |
| 日志系统 | 结构化日志记录 | Sprint 4-5 完善 |
| 监控告警 | 性能监控 & 错误追踪 | 上线后配置 |

---

## 附录

### A. 环境变量配置

```bash
# .env.local

# 数据库
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Redis
REDIS_URL="redis://..."

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""

# AI
ANTHROPIC_API_KEY=""
```

### B. 目录结构

```
supermart/
├── app/
│   ├── (auth)/                       # 认证页面组
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── profile/
│   │       ├── page.tsx
│   │       └── contents/page.tsx
│   ├── (main)/                       # 主站页面组
│   │   ├── page.tsx                  # 首页
│   │   ├── explore/page.tsx          # 浏览
│   │   ├── content/[id]/page.tsx     # 详情
│   │   ├── create/page.tsx           # 创建
│   │   └── edit/[id]/page.tsx        # 编辑
│   ├── actions/                      # Server Actions
│   │   ├── content.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── interaction.ts
│   │   └── meta.ts
│   ├── api/auth/[...nextauth]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui 基础组件
│   ├── common/                       # 通用组件 (Header, Footer, Pagination)
│   ├── content/                      # 内容组件 (Card, List, Detail, Form)
│   ├── interaction/                  # 互动组件 (RatingStars, Comment*, CollectionButton)
│   └── auth/                         # 认证组件 (Login, Register, Profile Form)
├── services/
│   └── content.service.ts            # 内容服务 (其他按需抽取)
├── lib/
│   ├── prisma.ts                     # 数据库客户端
│   ├── redis.ts                      # 缓存客户端
│   ├── auth.ts                       # NextAuth 配置
│   ├── constants.ts                  # 常量定义
│   └── utils.ts                      # 工具函数
├── types/
│   ├── api.ts                        # 所有 API 类型定义
│   └── next-auth.d.ts                # NextAuth 类型扩展
├── validators/
│   └── index.ts                      # 所有 Zod Schema
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── docs/
    ├── prd-supermart-skill.md
    ├── architecture.md
    └── technical-design.md
```

---

### C. 功能实现状态

> 更新日期：2026-03-13
> 本章节记录技术设计文档与实际代码的实现状态对比

#### 1. 页面模块

| 页面 | 路由 | 状态 | 备注 |
|------|------|------|------|
| 首页 | `/` | ✅ 已实现 | |
| 浏览 | `/explore` | ✅ 已实现 | |
| 详情 | `/content/[id]` | ✅ 已实现 | |
| 创建 | `/create` | ✅ 已实现 | |
| 编辑 | `/edit/[id]` | ✅ 已实现 | |
| 登录 | `/login` | ✅ 已实现 | |
| 注册 | `/register` | ✅ 已实现 | |
| 个人中心 | `/profile` | ✅ 已实现 | 包含我的内容功能 |

#### 2. 组件模块

| 模块 | 组件 | 状态 | 备注 |
|------|------|------|------|
| **ui/** | 全部 | ✅ 已实现 | shadcn/ui 组件 |
| **common/** | Header | ✅ 已实现 | |
| **common/** | Footer | ✅ 已实现 | |
| **common/** | Pagination | ✅ 已实现 | |
| **content/** | ContentCard | ✅ 已实现 | |
| **content/** | ContentList | ✅ 已实现 | |
| **content/** | ContentDetail | ✅ 已实现 | |
| **content/** | ContentForm | ✅ 已实现 | |
| **content/** | FileTree | 📋 待实现 | 依赖文件上传功能 |
| **content/** | CodePreview | 📋 待实现 | 依赖文件上传功能 |
| **content/** | SecurityReport | 📋 待实现 | 依赖 AI 服务 |
| **interaction/** | RatingStars | ✅ 已实现 | |
| **interaction/** | CommentForm | ✅ 已实现 | |
| **interaction/** | CommentSection | ✅ 已实现 | |
| **interaction/** | CollectionButton | ✅ 已实现 | |
| **auth/** | LoginForm | ✅ 已实现 | |
| **auth/** | RegisterForm | ✅ 已实现 | |
| **auth/** | ProfileForm | ✅ 已实现 | |

#### 3. Server Actions 模块

| 文件 | 状态 | 备注 |
|------|------|------|
| `content.ts` | ✅ 已实现 | 8 个函数 |
| `interaction.ts` | ✅ 已实现 | 8 个函数 |
| `auth.ts` | ✅ 已实现 | 2 个函数 |
| `user.ts` | ✅ 已实现 | 2 个函数 |
| `meta.ts` | ✅ 已实现 | 2 个函数 |

#### 4. 服务层模块

| 服务 | 状态 | 备注 |
|------|------|------|
| `content.service.ts` | ✅ 已实现 | 339 行，包含缓存管理 |
| `interaction.service.ts` | ⏭️ 不需要 | 逻辑简单，直接在 actions 层实现 |
| `ai.service.ts` | 📋 待实现 | AI 简介生成、安全报告 |
| `file.service.ts` | 📋 待实现 | 文件上传、ZIP 解析 |

#### 5. 基础设施层

| 模块 | 状态 | 备注 |
|------|------|------|
| `lib/prisma.ts` | ✅ 已实现 | |
| `lib/redis.ts` | ✅ 已实现 | 包含 cache()、invalidateCache() |
| `lib/auth.ts` | ✅ 已实现 | NextAuth v5 配置 |
| `lib/utils.ts` | ✅ 已实现 | cn() 等工具函数 |
| `lib/constants.ts` | ✅ 已实现 | 文档未提及，已补充 |

#### 6. 类型与验证模块

| 模块 | 状态 | 备注 |
|------|------|------|
| `types/api.ts` | ✅ 已实现 | 381 行，所有类型定义集中于此 |
| `types/next-auth.d.ts` | ✅ 已实现 | NextAuth 类型扩展 |
| `validators/index.ts` | ✅ 已实现 | 216 行，所有 Schema 集中于此 |

> **设计说明**: types/ 和 validators/ 采用单文件结构，原因是当前代码量不大（<400行），集中管理更便于查找和维护。后续如文件增长超过 500 行，可考虑按模块拆分。

#### 图例说明

| 标记 | 含义 |
|------|------|
| ✅ 已实现 | 代码已完成并可用 |
| 📋 待实现 | 计划中，尚未开发 |
| ⏭️ 不需要 | 经评估后决定不需要 |
| ⚠️ 部分实现 | 部分功能已完成 |

---

### D. API 汇总表

> 详细类型定义见 `types/api.ts`，验证规则见 `validators/index.ts`

#### 认证相关

| API | 权限 | 文件 | 说明 |
|-----|------|------|------|
| `register()` | 公开 | `auth.ts` | 注册新用户，自动登录 |
| `getCurrentUser()` | 登录 | `auth.ts` | 获取当前用户信息及统计 |

#### 内容相关

| API | 权限 | 文件 | 说明 |
|-----|------|------|------|
| `getContents(params)` | 公开 | `content.ts` | 获取内容列表，支持筛选/搜索/分页 |
| `getContent(id)` | 公开 | `content.ts` | 获取内容详情，自动增加浏览计数 |
| `createContent(data)` | 登录 | `content.ts` | 创建新内容，支持草稿/发布 |
| `updateContent(id, data)` | 作者 | `content.ts` | 更新内容 |
| `publishContent(id)` | 作者 | `content.ts` | 发布草稿内容 |
| `deleteContent(id)` | 作者 | `content.ts` | 删除内容 |
| `getMyContents(params)` | 登录 | `content.ts` | 获取当前用户创建的内容 |
| `getHomeData()` | 公开 | `content.ts` | 获取首页聚合数据 |

#### 互动相关

| API | 权限 | 文件 | 说明 |
|-----|------|------|------|
| `getComments(contentId, page)` | 公开 | `interaction.ts` | 获取评论列表 |
| `createComment(contentId, body)` | 登录 | `interaction.ts` | 创建评论 |
| `deleteComment(id)` | 作者 | `interaction.ts` | 删除评论 |
| `rateContent(contentId, score)` | 登录 | `interaction.ts` | 创建/更新评分 |
| `getUserRating(contentId)` | 登录 | `interaction.ts` | 获取当前用户评分 |
| `toggleCollection(contentId)` | 登录 | `interaction.ts` | 切换收藏状态 |
| `isCollected(contentId)` | 登录 | `interaction.ts` | 检查是否已收藏 |
| `getMyCollections(params)` | 登录 | `interaction.ts` | 获取收藏列表 |

#### 用户相关

| API | 权限 | 文件 | 说明 |
|-----|------|------|------|
| `updateProfile(data)` | 登录 | `user.ts` | 更新个人资料 |
| `updateAIConfig(config)` | 登录 | `user.ts` | 更新 AI 配置 |

#### 元数据相关

| API | 权限 | 文件 | 说明 |
|-----|------|------|------|
| `getCategories()` | 公开 | `meta.ts` | 获取所有分类 |
| `getTags()` | 公开 | `meta.ts` | 获取所有标签 |

#### 待实现 API

| API | 权限 | 说明 |
|-----|------|------|
| `searchContents(query)` | 公开 | 搜索内容 |
| `getSearchSuggestions(query)` | 公开 | 搜索建议 |
| `getUploadUrl(filename, type, size)` | 登录 | 获取文件上传凭证 |
| `confirmUpload(fileKey)` | 登录 | 确认上传完成 |

---

**变更记录**

| 版本 | 日期 | 作者 | 变更内容 |
|-----|------|------|---------|
| v1.0 | 2024-03-13 | Tech Team | 初始版本 |
| v1.1 | 2026-03-13 | Tech Team | 新增附录 C：功能实现状态 |
| v1.2 | 2026-03-13 | Tech Team | 新增附录 D：API 汇总表；删除独立 api.md |
