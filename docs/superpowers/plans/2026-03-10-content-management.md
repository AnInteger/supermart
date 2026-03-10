# 内容管理系统实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现内容的创建、编辑、发布、删除功能，以及内容列表和详情页

**Architecture:** Server Actions 处理业务逻辑，Prisma 管理数据，Markdown 编辑器支持富文本

**Tech Stack:** React Hook Form, Zod, Server Actions, react-markdown

---

## File Structure

```
app/
├── (main)/                    # 主站页面组
│   ├── layout.tsx
│   ├── page.tsx               # 首页
│   ├── explore/
│   │   └── page.tsx           # 浏览/搜索
│   ├── content/
│   │   └── [id]/
│   │       └── page.tsx       # 内容详情
│   ├── create/
│   │   └── page.tsx           # 创建内容
│   └── edit/
│       └── [id]/
│           └── page.tsx       # 编辑内容
├── actions/
│   └── content.ts             # 内容相关 Server Actions
services/
├── content.service.ts         # 内容服务层
components/
├── content/
│   ├── ContentCard.tsx        # 内容卡片
│   ├── ContentList.tsx        # 内容列表
│   ├── ContentDetail.tsx      # 内容详情
│   ├── ContentForm.tsx        # 创建/编辑表单
│   ├── RatingStars.tsx        # 评分星星
│   └── CategoryFilter.tsx     # 分类筛选
```

---

## Task 1: 创建内容服务层

**Files:**
- Create: `services/content.service.ts`

- [ ] **Step 1: 创建内容服务类**

Create: `services/content.service.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { redis, cache, invalidateCache } from '@/lib/redis';
import { ContentStatus, ContentType } from '@prisma/client';

export interface GetContentsParams {
  type?: ContentType;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  query?: string;
  sort?: 'latest' | 'popular' | 'rating';
  page?: number;
  pageSize?: number;
}

export interface CreateContentData {
  type: ContentType;
  name: string;
  description: string;
  categoryId: string;
  instruction?: string;
  toolsConfig?: Record<string, unknown>;
  setupGuide?: string;
  examples?: string;
  tagIds?: string[];
  fileIds?: string[];
}

export class ContentService {
  private static CACHE_PREFIX = 'content:';

  /**
   * 获取内容列表
   */
  async getList(params: GetContentsParams) {
    const {
      type,
      categoryId,
      tagId,
      authorId,
      query,
      sort = 'latest',
      page = 1,
      pageSize = 12,
    } = params;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 构建查询条件
    const where: any = {
      status: ContentStatus.PUBLISHED,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (tagId) {
      where.tags = { some: { tagId } };
    }
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // 排序
    const orderBy: any = {};
    switch (sort) {
      case 'popular':
        orderBy.viewCount = 'desc';
        break;
      case 'rating':
        orderBy.avgRating = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, icon: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
          _count: { select: { comments: true, ratings: true, collections: true } },
        },
      }),
      prisma.content.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: skip + take < total,
      },
    };
  }

  /**
   * 获取单个内容详情
   */
  async getById(id: string, userId?: string) {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        category: { select: { id: true, name: true, icon: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        files: true,
        _count: { select: { comments: true, ratings: true, collections: true } },
      },
    });

    if (!content) return null;

    // 获取当前用户的评分和收藏状态
    let userRating = null;
    let isCollected = false;

    if (userId) {
      const [rating, collection] = await Promise.all([
        prisma.rating.findUnique({
          where: { contentId_userId: { contentId: id, userId } },
        }),
        prisma.collection.findUnique({
          where: { userId_contentId: { userId, contentId: id } },
        }),
      ]);
      userRating = rating;
      isCollected = !!collection;
    }

    return {
      ...content,
      isOwner: content.authorId === userId,
      userRating,
      isCollected,
    };
  }

  /**
   * 创建内容
   */
  async create(data: CreateContentData, authorId: string) {
    const { tagIds, fileIds, ...contentData } = data;

    const content = await prisma.content.create({
      data: {
        ...contentData,
        authorId,
        status: ContentStatus.DRAFT,
        tags: tagIds
          ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
          : undefined,
        files: fileIds
          ? { connect: fileIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return content;
  }

  /**
   * 更新内容
   */
  async update(id: string, data: Partial<CreateContentData>) {
    const { tagIds, fileIds, ...contentData } = data;

    // 更新标签
    if (tagIds) {
      await prisma.contentTag.deleteMany({ where: { contentId: id } });
    }

    const content = await prisma.content.update({
      where: { id },
      data: {
        ...contentData,
        tags: tagIds
          ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
          : undefined,
        files: fileIds
          ? { set: fileIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    // 清除缓存
    await invalidateCache(`${ContentService.CACHE_PREFIX}detail:${id}`);

    return content;
  }

  /**
   * 发布内容
   */
  async publish(id: string) {
    const content = await prisma.content.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    await invalidateCache(`${ContentService.CACHE_PREFIX}detail:${id}`);
    return content;
  }

  /**
   * 删除内容
   */
  async delete(id: string) {
    await prisma.content.delete({ where: { id } });
    await invalidateCache(`${ContentService.CACHE_PREFIX}detail:${id}`);
  }

  /**
   * 增加浏览计数
   */
  async incrementViewCount(id: string) {
    await prisma.content.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * 重新计算评分
   */
  async recalculateRating(contentId: string) {
    const result = await prisma.rating.aggregate({
      where: { contentId },
      _avg: { score: true },
      _count: true,
    });

    await prisma.content.update({
      where: { id: contentId },
      data: {
        avgRating: result._avg.score,
        ratingCount: result._count,
      },
    });
  }

  /**
   * 获取首页数据
   */
  async getHomeData() {
    const cacheKey = `${ContentService.CACHE_PREFIX}home`;

    return cache(
      cacheKey,
      async () => {
        const [featured, latest, popular, categories, stats] = await Promise.all([
          // 精选推荐
          prisma.content.findMany({
            where: { status: ContentStatus.PUBLISHED, isFeatured: true },
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: this.getListInclude(),
          }),
          // 最新发布
          prisma.content.findMany({
            where: { status: ContentStatus.PUBLISHED },
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: this.getListInclude(),
          }),
          // 热门内容
          prisma.content.findMany({
            where: { status: ContentStatus.PUBLISHED },
            take: 8,
            orderBy: { viewCount: 'desc' },
            include: this.getListInclude(),
          }),
          // 分类
          prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { contents: { where: { status: ContentStatus.PUBLISHED } } } } },
          }),
          // 统计
          Promise.all([
            prisma.content.count({ where: { status: ContentStatus.PUBLISHED } }),
            prisma.user.count(),
            prisma.category.count(),
          ]),
        ]);

        return {
          featured,
          latest,
          popular,
          categories: categories.map((c) => ({
            ...c,
            contentsCount: c._count.contents,
          })),
          stats: {
            totalContents: stats[0],
            totalUsers: stats[1],
            totalCategories: stats[2],
          },
        };
      },
      300 // 5分钟缓存
    );
  }

  private getListInclude() {
    return {
      author: { select: { id: true, name: true, avatar: true } },
      category: { select: { id: true, name: true, icon: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      _count: { select: { comments: true, ratings: true } },
    };
  }
}

export const contentService = new ContentService();
```

- [ ] **Step 2: 提交内容服务**

```bash
git add services/content.service.ts
git commit -m "feat: add content service layer"
```

---

## Task 2: 创建内容 Server Actions

**Files:**
- Create: `app/actions/content.ts`

- [ ] **Step 1: 创建内容 Actions**

Create: `app/actions/content.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { contentService } from '@/services/content.service';
import { createContentSchema, updateContentSchema, getContentsSchema } from '@/validators';
import { ApiResponse, PaginatedResponse, ContentListItem, ContentDetail } from '@/types/api';
import { ContentStatus } from '@prisma/client';

/**
 * 获取内容列表
 */
export async function getContents(
  params: Record<string, unknown>
): Promise<ApiResponse<PaginatedResponse<ContentListItem>>> {
  const validated = getContentsSchema.safeParse(params);

  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
    };
  }

  try {
    const result = await contentService.getList(validated.data);

    return {
      success: true,
      data: {
        items: result.items.map((content) => ({
          id: content.id,
          type: content.type,
          name: content.name,
          description: content.description,
          author: content.author,
          category: content.category,
          tags: content.tags.map((t) => t.tag),
          avgRating: content.avgRating,
          viewCount: content.viewCount,
          createdAt: content.createdAt.toISOString(),
          _count: content._count,
        })),
        pagination: result.pagination,
      },
    };
  } catch (error) {
    console.error('Get contents error:', error);
    return {
      success: false,
      error: '获取内容列表失败',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * 获取内容详情
 */
export async function getContent(id: string): Promise<ApiResponse<ContentDetail>> {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const content = await contentService.getById(id, userId);

    if (!content) {
      return {
        success: false,
        error: '内容不存在',
        code: 'NOT_FOUND',
      };
    }

    // 增加浏览计数（仅发布状态）
    if (content.status === ContentStatus.PUBLISHED) {
      await contentService.incrementViewCount(id);
    }

    return {
      success: true,
      data: {
        id: content.id,
        type: content.type,
        name: content.name,
        description: content.description,
        instruction: content.instruction,
        toolsConfig: content.toolsConfig as Record<string, unknown> | null,
        setupGuide: content.setupGuide,
        examples: content.examples,
        status: content.status,
        publishedAt: content.publishedAt?.toISOString() || null,
        updatedAt: content.updatedAt.toISOString(),
        author: content.author,
        category: content.category,
        tags: content.tags.map((t) => t.tag),
        files: content.files,
        avgRating: content.avgRating,
        viewCount: content.viewCount,
        isOwner: content.isOwner,
        userRating: content.userRating,
        isCollected: content.isCollected,
        createdAt: content.createdAt.toISOString(),
        _count: content._count,
      },
    };
  } catch (error) {
    console.error('Get content error:', error);
    return {
      success: false,
      error: '获取内容详情失败',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * 创建内容
 */
export async function createContent(
  data: Record<string, unknown>
): Promise<ApiResponse<{ id: string; name: string; status: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '请先登录',
      code: 'UNAUTHORIZED',
    };
  }

  const validated = createContentSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
      details: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const content = await contentService.create(validated.data, session.user.id);

    revalidatePath('/explore');

    return {
      success: true,
      data: {
        id: content.id,
        name: content.name,
        status: content.status,
      },
    };
  } catch (error) {
    console.error('Create content error:', error);
    return {
      success: false,
      error: '创建内容失败',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * 更新内容
 */
export async function updateContent(
  id: string,
  data: Record<string, unknown>
): Promise<ApiResponse<{ id: string; name: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '请先登录',
      code: 'UNAUTHORIZED',
    };
  }

  // 检查权限
  const existing = await contentService.getById(id, session.user.id);
  if (!existing || !existing.isOwner) {
    return {
      success: false,
      error: '无权编辑此内容',
      code: 'FORBIDDEN',
    };
  }

  const validated = updateContentSchema.safeParse({ ...data, id });

  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
    };
  }

  try {
    const content = await contentService.update(id, validated.data);

    revalidatePath(`/content/${id}`);
    revalidatePath('/explore');

    return {
      success: true,
      data: {
        id: content.id,
        name: content.name,
      },
    };
  } catch (error) {
    console.error('Update content error:', error);
    return {
      success: false,
      error: '更新内容失败',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * 发布内容
 */
export async function publishContent(
  id: string
): Promise<ApiResponse<{ id: string; status: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '请先登录',
      code: 'UNAUTHORIZED',
    };
  }

  const existing = await contentService.getById(id, session.user.id);
  if (!existing || !existing.isOwner) {
    return {
      success: false,
      error: '无权发布此内容',
      code: 'FORBIDDEN',
    };
  }

  try {
    const content = await contentService.publish(id);

    revalidatePath(`/content/${id}`);
    revalidatePath('/explore');

    return {
      success: true,
      data: {
        id: content.id,
        status: content.status,
      },
    };
  } catch (error) {
    console.error('Publish content error:', error);
    return {
      success: false,
      error: '发布内容失败',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * 删除内容
 */
export async function deleteContent(id: string): Promise<ApiResponse<{ success: boolean }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '请先登录',
      code: 'UNAUTHORIZED',
    };
  }

  const existing = await contentService.getById(id, session.user.id);
  if (!existing || !existing.isOwner) {
    return {
      success: false,
      error: '无权删除此内容',
      code: 'FORBIDDEN',
    };
  }

  try {
    await contentService.delete(id);

    revalidatePath('/explore');

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Delete content error:', error);
    return {
      success: false,
      error: '删除内容失败',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * 获取我的内容
 */
export async function getMyContents(
  params: Record<string, unknown>
): Promise<ApiResponse<PaginatedResponse<ContentListItem>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '请先登录',
      code: 'UNAUTHORIZED',
    };
  }

  const result = await contentService.getList({
    ...params,
    authorId: session.user.id,
  });

  return {
    success: true,
    data: {
      items: result.items.map((content) => ({
        id: content.id,
        type: content.type,
        name: content.name,
        description: content.description,
        author: content.author,
        category: content.category,
        tags: content.tags.map((t) => t.tag),
        avgRating: content.avgRating,
        viewCount: content.viewCount,
        createdAt: content.createdAt.toISOString(),
        status: content.status,
        _count: content._count,
      })),
      pagination: result.pagination,
    },
  };
}

/**
 * 获取首页数据
 */
export async function getHomeData() {
  try {
    const data = await contentService.getHomeData();
    return { success: true, data };
  } catch (error) {
    console.error('Get home data error:', error);
    return { success: false, error: '获取首页数据失败' };
  }
}
```

- [ ] **Step 2: 提交内容 Actions**

```bash
git add app/actions/content.ts
git commit -m "feat: add content server actions"
```

---

## Task 3: 创建内容卡片和列表组件

**Files:**
- Create: `components/content/ContentCard.tsx`
- Create: `components/content/ContentList.tsx`

- [ ] **Step 1: 创建内容卡片组件**

Create: `components/content/ContentCard.tsx`

```tsx
import Link from 'next/link';
import { ContentListItem } from '@/types/api';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';

interface ContentCardProps {
  content: ContentListItem;
}

export function ContentCard({ content }: ContentCardProps) {
  const authorInitial = content.author.name?.charAt(0).toUpperCase() || 'U';

  return (
    <Link href={`/content/${content.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge variant={content.type === 'SKILL' ? 'default' : 'secondary'}>
              {content.type}
            </Badge>
            {content.avgRating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{content.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {content.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {content.description}
          </p>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={content.author.avatar || ''} />
                <AvatarFallback className="text-xs">{authorInitial}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {content.author.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3" />
                {content.viewCount}
              </span>
              <span>{formatRelativeTime(content.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

// 图标组件
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
```

- [ ] **Step 2: 创建内容列表组件**

Create: `components/content/ContentList.tsx`

```tsx
'use client';

import { ContentCard } from './ContentCard';
import { ContentListItem, PaginationInfo } from '@/types/api';
import { Pagination } from '@/components/common/Pagination';

interface ContentListProps {
  items: ContentListItem[];
  pagination?: PaginationInfo;
  emptyMessage?: string;
}

export function ContentList({ items, pagination, emptyMessage = '暂无内容' }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination pagination={pagination} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建分页组件**

Create: `components/common/Pagination.tsx`

```tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PaginationInfo } from '@/types/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination: PaginationInfo;
}

export function Pagination({ pagination }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, totalPages, hasMore } = pagination;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        上一页
      </Button>

      <span className="text-sm text-muted-foreground px-4">
        第 {page} / {totalPages} 页
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={!hasMore}
        onClick={() => goToPage(page + 1)}
      >
        下一页
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: 安装 lucide-react 图标库**

```bash
npm install lucide-react
```

- [ ] **Step 5: 提交内容卡片组件**

```bash
git add components/content/ components/common/Pagination.tsx package.json
git commit -m "feat: add ContentCard and ContentList components"
```

---

## Task 4: 创建首页

**Files:**
- Create: `app/(main)/layout.tsx`
- Modify: `app/page.tsx` (改为首页内容)

- [ ] **Step 1: 创建主站布局**

Create: `app/(main)/layout.tsx`

```tsx
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 2: 创建首页**

修改 `app/page.tsx`:

```tsx
import { getHomeData } from '@/app/actions/content';
import { ContentList } from '@/components/content/ContentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function HomePage() {
  const result = await getHomeData();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">加载失败</p>
      </div>
    );
  }

  const { featured, latest, popular, categories, stats } = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-12">
        <h1 className="text-4xl font-bold mb-4">SuperMart</h1>
        <p className="text-xl text-muted-foreground mb-8">
          国内垂类AI工具平台，让专业知识规模化复用
        </p>
        <div className="flex justify-center gap-8 text-center">
          <div>
            <p className="text-3xl font-bold">{stats.totalContents}</p>
            <p className="text-sm text-muted-foreground">Skill/Agent</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">用户</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalCategories}</p>
            <p className="text-sm text-muted-foreground">分类</p>
          </div>
        </div>
      </section>

      {/* 分类导航 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">探索分类</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/explore?category=${category.slug}`}>
              <Badge variant="outline" className="text-sm py-2 px-4">
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.name}
                <span className="ml-2 text-muted-foreground">
                  ({category.contentsCount})
                </span>
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* 精选推荐 */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">精选推荐</h2>
          <ContentList items={featured} />
        </section>
      )}

      {/* 最新发布 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">最新发布</h2>
          <Link href="/explore?sort=latest" className="text-sm text-primary hover:underline">
            查看更多 →
          </Link>
        </div>
        <ContentList items={latest} />
      </section>

      {/* 热门内容 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">热门内容</h2>
          <Link href="/explore?sort=popular" className="text-sm text-primary hover:underline">
            查看更多 →
          </Link>
        </div>
        <ContentList items={popular} />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: 提交首页**

```bash
git add app/page.tsx app/\(main\)/layout.tsx
git commit -m "feat: add home page with featured, latest and popular content"
```

---

## Task 5: 创建浏览/搜索页面

**Files:**
- Create: `app/(main)/explore/page.tsx`
- Create: `components/content/CategoryFilter.tsx`

- [ ] **Step 1: 创建分类筛选组件**

Create: `components/content/CategoryFilter.tsx`

```tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Category } from '@/types/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selectedId?: string;
}

export function CategoryFilter({ categories, selectedId }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (categoryId: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    params.delete('page'); // 重置分页
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!selectedId ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSelect(undefined)}
      >
        全部
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedId === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSelect(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建浏览页面**

Create: `app/(main)/explore/page.tsx`

```tsx
import { getContents } from '@/app/actions/content';
import { getCategories } from '@/app/actions/meta';
import { ContentList } from '@/components/content/ContentList';
import { CategoryFilter } from '@/components/content/CategoryFilter';
import { SearchBar } from '@/components/common/SearchBar';

interface ExplorePageProps {
  searchParams: {
    category?: string;
    type?: 'SKILL' | 'AGENT';
    sort?: 'latest' | 'popular' | 'rating';
    page?: string;
    query?: string;
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const [contentsResult, categoriesResult] = await Promise.all([
    getContents({
      categoryId: searchParams.category,
      type: searchParams.type,
      sort: searchParams.sort || 'latest',
      page: parseInt(searchParams.page || '1'),
      query: searchParams.query,
    }),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">探索 Skill & Agent</h1>

      {/* 搜索栏 */}
      <div className="mb-6">
        <SearchBar defaultValue={searchParams.query} />
      </div>

      {/* 筛选区 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {categoriesResult.success && (
          <CategoryFilter
            categories={categoriesResult.data}
            selectedId={searchParams.category}
          />
        )}
      </div>

      {/* 内容列表 */}
      {contentsResult.success ? (
        <ContentList
          items={contentsResult.data.items}
          pagination={contentsResult.data.pagination}
        />
      ) : (
        <p className="text-center text-muted-foreground">
          {contentsResult.error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建搜索栏组件**

Create: `components/common/SearchBar.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(defaultValue || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) {
      params.set('query', query);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="search"
        placeholder="搜索 Skill 或 Agent..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
      <Button type="submit" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: 创建元数据 Actions**

Create: `app/actions/meta.ts`

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            contents: {
              where: { status: ContentStatus.PUBLISHED },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        contentsCount: c._count.contents,
      })),
    };
  } catch (error) {
    return { success: false, error: '获取分类失败' };
  }
}

export async function getPopularTags(limit: number = 20) {
  try {
    const tags = await prisma.tag.findMany({
      take: limit,
      orderBy: {
        contents: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    return {
      success: true,
      data: tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        contentsCount: t._count.contents,
      })),
    };
  } catch (error) {
    return { success: false, error: '获取标签失败' };
  }
}
```

- [ ] **Step 5: 提交浏览页面**

```bash
git add app/\(main\)/explore/ app/actions/meta.ts components/content/CategoryFilter.tsx components/common/SearchBar.tsx
git commit -m "feat: add explore page with search and filters"
```

---

## Summary

完成本计划后，你将拥有：

✅ 内容服务层（业务逻辑分离）
✅ 内容 CRUD Server Actions
✅ 内容卡片和列表组件
✅ 首页（精选/最新/热门）
✅ 浏览/搜索页面

**下一步**: 实现内容详情页和创建页面
