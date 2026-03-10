# SuperMart 架构设计文档

> 创建日期：2026-03-10
> 版本：v1.0

## 一、架构概览

### 1.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | 全栈框架 |
| 语言 | TypeScript | 类型安全 |
| UI | Tailwind CSS + shadcn/ui | 组件库 |
| ORM | Prisma | 数据库操作 |
| 数据库 | PostgreSQL (Supabase) | 主数据库 |
| 缓存 | Redis (Upstash) | 缓存/会话 |
| 认证 | Auth.js | 用户认证 |
| 文件 | Cloudflare R2 | 对象存储 |
| 部署 | Vercel | 托管平台 |

### 1.2 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  Page Components│  │  Server Actions (API 入口)      │  │
│  │  (Server/Client)│  │  表单验证、权限检查、调用Service  │  │
│  └────────┬────────┘  └────────────────┬────────────────┘  │
└───────────┼────────────────────────────┼───────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services (业务逻辑)                                   │  │
│  │  - ContentService: 内容CRUD、搜索、统计               │  │
│  │  - UserService: 用户管理、认证                         │  │
│  │  - InteractionService: 评论、评分、收藏               │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                           │
│  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │  Types (类型定义)   │  │  Validators (验证规则)      │   │
│  │  - Content, User   │  │  - zod schemas             │   │
│  │  - DTOs            │  │  - business rules          │   │
│  └────────────────────┘  └─────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Prisma     │  │  Redis      │  │  External Services  │ │
│  │  (Database) │  │  (Cache)    │  │  (AI APIs, R2)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、目录结构

```
supermart/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关页面（布局组）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (main)/                   # 主站页面（布局组）
│   │   ├── page.tsx              # 首页
│   │   ├── explore/              # 浏览/搜索
│   │   │   └── page.tsx
│   │   ├── content/              # 内容详情
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── create/               # 创建内容
│   │   │   └── page.tsx
│   │   ├── profile/              # 个人中心
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                      # API Routes（第三方回调等）
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   │
│   ├── actions/                  # Server Actions
│   │   ├── content.ts            # 内容相关操作
│   │   ├── user.ts               # 用户相关操作
│   │   ├── interaction.ts        # 互动相关（评论/评分/收藏）
│   │   └── index.ts              # 统一导出
│   │
│   ├── layout.tsx                # 根布局
│   └── globals.css               # 全局样式
│
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── common/                   # 通用组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchBar.tsx
│   │   └── Pagination.tsx
│   │
│   ├── content/                  # 内容相关组件
│   │   ├── ContentCard.tsx       # 内容卡片
│   │   ├── ContentList.tsx       # 内容列表
│   │   ├── ContentDetail.tsx     # 内容详情
│   │   ├── ContentForm.tsx       # 创建/编辑表单
│   │   └── RatingStars.tsx       # 评分星星
│   │
│   └── layout/                   # 布局组件
│       ├── Sidebar.tsx
│       └── Container.tsx
│
├── lib/                          # 核心库
│   ├── prisma.ts                 # Prisma 客户端
│   ├── redis.ts                  # Redis 客户端
│   ├── auth.ts                   # Auth.js 配置
│   ├── utils.ts                  # 工具函数
│   └── constants.ts              # 常量定义
│
├── services/                     # 业务服务层
│   ├── content.service.ts        # 内容服务
│   ├── user.service.ts           # 用户服务
│   ├── interaction.service.ts    # 互动服务
│   ├── search.service.ts         # 搜索服务
│   └── ai.service.ts             # AI 模型对接
│
├── types/                        # TypeScript 类型定义
│   ├── content.ts
│   ├── user.ts
│   └── api.ts                    # API 响应类型
│
├── validators/                   # Zod 验证规则
│   ├── content.ts
│   ├── user.ts
│   └── interaction.ts
│
├── hooks/                        # React Hooks
│   ├── useContent.ts
│   ├── useAuth.ts
│   └── usePagination.ts
│
├── prisma/                       # Prisma 配置
│   ├── schema.prisma
│   ├── seed.ts                   # 初始数据
│   └── migrations/
│
├── public/                       # 静态资源
│   ├── images/
│   └── icons/
│
├── docs/                         # 文档
│   ├── requirements.md
│   ├── architecture.md
│   └── api.md
│
├── .env.local                    # 环境变量（本地）
├── .env.example                  # 环境变量示例
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 三、数据模型详解

### 3.1 核心实体

```
┌─────────────────────────────────────────────────────────────┐
│                          User                                │
├─────────────────────────────────────────────────────────────┤
│ - 用户注册/登录（邮箱）                                       │
│ - 角色区分（USER/ADMIN）                                     │
│ - AI配置存储（用户自己的API Key）                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         Content                              │
├─────────────────────────────────────────────────────────────┤
│ - 类型：SKILL / AGENT                                        │
│ - 内容字段：                                                  │
│   - instruction: 操作指令（核心）                             │
│   - toolsConfig: 工具配置JSON                                │
│   - setupGuide: 分步设置指南                                 │
│   - examples: 使用案例                                       │
│ - 状态：DRAFT / PUBLISHED / ARCHIVED                        │
│ - 统计缓存：viewCount, avgRating, ratingCount              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        Category                              │
├─────────────────────────────────────────────────────────────┤
│ - 预设分类：                                                  │
│   - 软件开发、建筑设计、法律服务、设计创意、社媒运营          │
│ - 支持层级扩展（parentId）                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 实体关系

```
User (1) ────────< (N) Content
  │                    │
  │                    ├──< (N) File
  │                    │
  │                    ├──< (N) Comment
  │                    │        │
  │                    │        └──< (1) User
  │                    │
  │                    ├──< (N) Rating
  │                    │        │
  │                    │        └──< (1) User
  │                    │
  │                    └──< (N) Collection
  │                             │
  │                             └──< (1) User
  │
  └──< (N) Collection ──> (1) Content

Category (1) ────────< (N) Content

Content (N) <───────> (N) Tag (通过 ContentTag)
```

---

## 四、Server Actions 设计

### 4.1 内容相关 (content.ts)

```typescript
// app/actions/content.ts

'use server'

// 获取内容列表
export async function getContents(params: {
  type?: 'SKILL' | 'AGENT'
  categoryId?: string
  query?: string
  sort?: 'latest' | 'popular' | 'rating'
  page?: number
  limit?: number
}): Promise<{ contents: Content[], total: number }>

// 获取单个内容
export async function getContentById(id: string): Promise<Content | null>

// 创建内容
export async function createContent(data: CreateContentInput): Promise<Content>

// 更新内容
export async function updateContent(id: string, data: UpdateContentInput): Promise<Content>

// 删除内容
export async function deleteContent(id: string): Promise<void>

// 发布内容
export async function publishContent(id: string): Promise<Content>

// 获取用户创建的内容
export async function getMyContents(): Promise<Content[]>

// 搜索内容
export async function searchContents(query: string): Promise<Content[]>
```

### 4.2 用户相关 (user.ts)

```typescript
// app/actions/user.ts

'use server'

// 获取当前用户
export async function getCurrentUser(): Promise<User | null>

// 更新用户资料
export async function updateProfile(data: UpdateProfileInput): Promise<User>

// 更新AI配置
export async function updateAIConfig(config: AIConfigInput): Promise<User>

// 获取用户收藏
export async function getMyCollections(): Promise<Content[]>
```

### 4.3 互动相关 (interaction.ts)

```typescript
// app/actions/interaction.ts

'use server'

// 评论
export async function createComment(data: CreateCommentInput): Promise<Comment>
export async function deleteComment(id: string): Promise<void>
export async function getComments(contentId: string): Promise<Comment[]>

// 评分
export async function createOrUpdateRating(data: RatingInput): Promise<Rating>
export async function getUserRating(contentId: string): Promise<Rating | null>

// 收藏
export async function toggleCollection(contentId: string): Promise<{ collected: boolean }>
export async function isCollected(contentId: string): Promise<boolean>
```

---

## 五、服务层设计

### 5.1 ContentService

```typescript
// services/content.service.ts

export class ContentService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

  // 创建内容
  async create(data: CreateContentInput, authorId: string): Promise<Content>

  // 更新内容
  async update(id: string, data: UpdateContentInput): Promise<Content>

  // 获取列表（带缓存）
  async getList(params: ListParams): Promise<PaginatedResult<Content>>

  // 搜索（PostgreSQL全文搜索）
  async search(query: string): Promise<Content[]>

  // 增加浏览计数
  async incrementViewCount(id: string): Promise<void>

  // 重新计算评分
  async recalculateRating(contentId: string): Promise<void>
}
```

### 5.2 SearchService

```typescript
// services/search.service.ts

export class SearchService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

  // 全文搜索
  async search(query: string, filters?: SearchFilters): Promise<SearchResult>

  // 搜索建议（自动补全）
  async getSuggestions(query: string): Promise<string[]>

  // 热门搜索词
  async getTrendingSearches(): Promise<string[]>
}
```

---

## 六、缓存策略

### 6.1 Redis 缓存键设计

```
content:list:{type}:{category}:{sort}:{page}  # 内容列表
content:detail:{id}                            # 内容详情
content:search:{query_hash}                    # 搜索结果
user:profile:{id}                              # 用户信息
category:all                                   # 分类列表
stats:home                                     # 首页统计
```

### 6.2 缓存过期时间

| 数据类型 | TTL | 说明 |
|----------|-----|------|
| 内容详情 | 5分钟 | 变更后主动失效 |
| 内容列表 | 2分钟 | 分页数据 |
| 搜索结果 | 10分钟 | 查询较稳定 |
| 用户资料 | 30分钟 | 低频变更 |
| 分类列表 | 1小时 | 几乎不变 |

---

## 七、安全设计

### 7.1 认证授权

- **认证**：Auth.js (NextAuth) 支持邮箱/密码登录
- **授权**：
  - 用户只能编辑/删除自己创建的内容
  - 管理员可以管理所有内容
  - Server Actions 内部进行权限检查

### 7.2 数据验证

- **前端**：React Hook Form + Zod
- **后端**：Server Actions 中使用 Zod 验证

### 7.3 敏感数据

- 用户 API Key 加密存储（后期）
- 环境变量管理敏感配置
- 日志脱敏

---

## 八、扩展计划

### 8.1 后期架构演进

```
阶段二：引入向量搜索
├── 添加 Pinecone/Milvus 向量数据库
├── 内容向量化服务
└── 语义搜索 API

阶段三：微服务拆分（如需要）
├── 内容服务（主应用）
├── 搜索服务
├── AI服务（Python）
└── 支付服务
```

### 8.2 可扩展性设计

- Service 层抽象，便于替换实现
- 适配器模式对接不同 AI 模型
- 事件驱动预留扩展点

---

**文档版本**：v1.0
**最后更新**：2026-03-10
