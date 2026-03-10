# 互动功能实施计划（评论、评分、收藏）

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现评论、评分、收藏功能，增强用户互动

**Architecture:** Server Actions + 乐观更新，评分使用原子操作确保一致性

**Tech Stack:** React Hook Form, Zod, Server Actions

---

## File Structure

```
app/
├── actions/
│   └── interaction.ts         # 互动相关 Server Actions
components/
├── interaction/
│   ├── CommentSection.tsx     # 评论区
│   ├── CommentForm.tsx        # 评论表单
│   ├── RatingStars.tsx        # 评分星星（可交互）
│   └── CollectionButton.tsx   # 收藏按钮
```

---

## Task 1: 创建互动 Server Actions

**Files:**
- Create: `app/actions/interaction.ts`

- [ ] **Step 1: 创建互动 Actions**

Create: `app/actions/interaction.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse, PaginatedResponse, Comment } from '@/types/api';
import {
  createCommentSchema,
  deleteCommentSchema,
  rateContentSchema,
  toggleCollectionSchema,
  getCommentsSchema,
} from '@/validators';

// ============================================
// 评论相关
// ============================================

export async function getComments(
  input: Record<string, unknown>
): Promise<ApiResponse<PaginatedResponse<Comment>>> {
  const validated = getCommentsSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
    };
  }

  const { contentId, page = 1, pageSize = 10 } = validated.data;
  const skip = (page - 1) * pageSize;

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { contentId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.comment.count({ where: { contentId } }),
    ]);

    return {
      success: true,
      data: {
        items: comments.map((c) => ({
          id: c.id,
          body: c.body,
          author: c.author,
          isOwner: userId === c.authorId,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasMore: skip + pageSize < total,
        },
      },
    };
  } catch (error) {
    console.error('Get comments error:', error);
    return { success: false, error: '获取评论失败' };
  }
}

export async function createComment(
  input: Record<string, unknown>
): Promise<ApiResponse<Comment>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: '请先登录', code: 'UNAUTHORIZED' };
  }

  const validated = createCommentSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
      details: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { contentId, body } = validated.data;

  try {
    const comment = await prisma.comment.create({
      data: {
        contentId,
        authorId: session.user.id,
        body,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    revalidatePath(`/content/${contentId}`);

    return {
      success: true,
      data: {
        id: comment.id,
        body: comment.body,
        author: comment.author,
        isOwner: true,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Create comment error:', error);
    return { success: false, error: '创建评论失败' };
  }
}

export async function deleteComment(
  input: Record<string, unknown>
): Promise<ApiResponse<{ success: boolean }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: '请先登录', code: 'UNAUTHORIZED' };
  }

  const validated = deleteCommentSchema.safeParse(input);

  if (!validated.success) {
    return { success: false, error: '参数验证失败' };
  }

  const { id } = validated.data;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, contentId: true },
    });

    if (!comment) {
      return { success: false, error: '评论不存在', code: 'NOT_FOUND' };
    }

    if (comment.authorId !== session.user.id) {
      return { success: false, error: '无权删除此评论', code: 'FORBIDDEN' };
    }

    await prisma.comment.delete({ where: { id } });
    revalidatePath(`/content/${comment.contentId}`);

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error('Delete comment error:', error);
    return { success: false, error: '删除评论失败' };
  }
}

// ============================================
// 评分相关
// ============================================

export async function rateContent(
  input: Record<string, unknown>
): Promise<ApiResponse<{ score: number; avgRating: number | null }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: '请先登录', code: 'UNAUTHORIZED' };
  }

  const validated = rateContentSchema.safeParse(input);

  if (!validated.success) {
    return { success: false, error: '参数验证失败' };
  }

  const { contentId, score } = validated.data;

  try {
    // Upsert 评分
    await prisma.rating.upsert({
      where: {
        contentId_userId: {
          contentId,
          userId: session.user.id,
        },
      },
      update: { score },
      create: {
        contentId,
        userId: session.user.id,
        score,
      },
    });

    // 重新计算平均评分
    const result = await prisma.rating.aggregate({
      where: { contentId },
      _avg: { score: true },
      _count: true,
    });

    const avgRating = result._avg.score;
    const ratingCount = result._count;

    await prisma.content.update({
      where: { id: contentId },
      data: { avgRating, ratingCount },
    });

    revalidatePath(`/content/${contentId}`);

    return {
      success: true,
      data: { score, avgRating },
    };
  } catch (error) {
    console.error('Rate content error:', error);
    return { success: false, error: '评分失败' };
  }
}

export async function getUserRating(
  contentId: string
): Promise<ApiResponse<{ score: number } | null>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: true, data: null };
  }

  try {
    const rating = await prisma.rating.findUnique({
      where: {
        contentId_userId: {
          contentId,
          userId: session.user.id,
        },
      },
    });

    return {
      success: true,
      data: rating ? { score: rating.score } : null,
    };
  } catch (error) {
    console.error('Get user rating error:', error);
    return { success: false, error: '获取评分失败' };
  }
}

// ============================================
// 收藏相关
// ============================================

export async function toggleCollection(
  input: Record<string, unknown>
): Promise<ApiResponse<{ collected: boolean }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: '请先登录', code: 'UNAUTHORIZED' };
  }

  const validated = toggleCollectionSchema.safeParse(input);

  if (!validated.success) {
    return { success: false, error: '参数验证失败' };
  }

  const { contentId } = validated.data;

  try {
    const existing = await prisma.collection.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
    });

    if (existing) {
      await prisma.collection.delete({
        where: { id: existing.id },
      });
      return { success: true, data: { collected: false } };
    } else {
      await prisma.collection.create({
        data: {
          userId: session.user.id,
          contentId,
        },
      });
      return { success: true, data: { collected: true } };
    }
  } catch (error) {
    console.error('Toggle collection error:', error);
    return { success: false, error: '操作失败' };
  }
}

export async function isCollected(
  contentId: string
): Promise<ApiResponse<boolean>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: true, data: false };
  }

  try {
    const collection = await prisma.collection.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
    });

    return { success: true, data: !!collection };
  } catch (error) {
    console.error('Check collection error:', error);
    return { success: false, error: '检查收藏状态失败' };
  }
}

export async function getMyCollections(
  input: Record<string, unknown>
): Promise<ApiResponse<PaginatedResponse<any>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: '请先登录', code: 'UNAUTHORIZED' };
  }

  const page = (input.page as number) || 1;
  const pageSize = (input.pageSize as number) || 12;
  const skip = (page - 1) * pageSize;

  try {
    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where: { userId: session.user.id },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          content: {
            include: {
              author: { select: { id: true, name: true, avatar: true } },
              category: { select: { id: true, name: true, icon: true } },
            },
          },
        },
      }),
      prisma.collection.count({ where: { userId: session.user.id } }),
    ]);

    return {
      success: true,
      data: {
        items: collections.map((c) => ({
          id: c.content.id,
          name: c.content.name,
          description: c.content.description,
          type: c.content.type,
          author: c.content.author,
          category: c.content.category,
          collectedAt: c.createdAt.toISOString(),
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasMore: skip + pageSize < total,
        },
      },
    };
  } catch (error) {
    console.error('Get collections error:', error);
    return { success: false, error: '获取收藏失败' };
  }
}
```

- [ ] **Step 2: 提交互动 Actions**

```bash
git add app/actions/interaction.ts
git commit -m "feat: add interaction server actions (comments, ratings, collections)"
```

---

## Task 2: 创建评分星星组件

**Files:**
- Create: `components/interaction/RatingStars.tsx`

- [ ] **Step 1: 创建可交互评分星星组件**

Create: `components/interaction/RatingStars.tsx`

```tsx
'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { rateContent } from '@/app/actions/interaction';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RatingStarsProps {
  contentId: string;
  initialRating?: number;
  avgRating?: number | null;
  ratingCount?: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function RatingStars({
  contentId,
  initialRating = 0,
  avgRating,
  ratingCount = 0,
  readonly = false,
  size = 'md',
  showCount = false,
}: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleRate = (score: number) => {
    if (readonly || isPending) return;

    startTransition(async () => {
      const result = await rateContent({ contentId, score });

      if (result.success) {
        setRating(score);
        toast.success('评分成功');
      } else {
        toast.error(result.error || '评分失败');
      }
    });
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly || isPending}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => handleRate(star)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300'
              )}
            />
          </button>
        ))}
      </div>

      {showCount && (
        <span className="text-sm text-muted-foreground ml-2">
          {avgRating ? avgRating.toFixed(1) : '0.0'}
          {ratingCount > 0 && ` (${ratingCount})`}
        </span>
      )}
    </div>
  );
}

// 只读版本，用于列表展示
export function RatingDisplay({
  avgRating,
  ratingCount,
  size = 'sm',
}: {
  avgRating?: number | null;
  ratingCount?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const displayRating = avgRating || 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= Math.round(displayRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            )}
          />
        ))}
      </div>
      {ratingCount !== undefined && ratingCount > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          {displayRating.toFixed(1)} ({ratingCount})
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 安装 lucide-react 图标库**

```bash
npm install lucide-react
```

- [ ] **Step 3: 提交评分组件**

```bash
git add components/interaction/RatingStars.tsx
git commit -m "feat: add interactive RatingStars component"
```

---

## Task 3: 创建收藏按钮组件

**Files:**
- Create: `components/interaction/CollectionButton.tsx`

- [ ] **Step 1: 创建收藏按钮**

Create: `components/interaction/CollectionButton.tsx`

```tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleCollection, isCollected } from '@/app/actions/interaction';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CollectionButtonProps {
  contentId: string;
  initialCollected?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CollectionButton({
  contentId,
  initialCollected = false,
  showText = true,
  size = 'md',
}: CollectionButtonProps) {
  const [collected, setCollected] = useState(initialCollected);
  const [isPending, startTransition] = useTransition();

  // 获取实时收藏状态
  useEffect(() => {
    isCollected(contentId).then((result) => {
      if (result.success) {
        setCollected(result.data);
      }
    });
  }, [contentId]);

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleCollection({ contentId });

      if (result.success) {
        setCollected(result.data.collected);
        toast.success(result.data.collected ? '已收藏' : '已取消收藏');
      } else {
        toast.error(result.error || '操作失败');
      }
    });
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSize = {
    sm: 'sm' as const,
    md: 'default' as const,
    lg: 'lg' as const,
  };

  return (
    <Button
      variant={collected ? 'default' : 'outline'}
      size={buttonSize[size]}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          collected && 'fill-current'
        )}
      />
      {showText && (
        <span className="ml-2">
          {collected ? '已收藏' : '收藏'}
        </span>
      )}
    </Button>
  );
}
```

- [ ] **Step 2: 提交收藏按钮**

```bash
git add components/interaction/CollectionButton.tsx
git commit -m "feat: add CollectionButton component with optimistic updates"
```

---

## Task 4: 创建评论组件

**Files:**
- Create: `components/interaction/CommentForm.tsx`
- Create: `components/interaction/CommentSection.tsx`

- [ ] **Step 1: 创建评论表单**

Create: `components/interaction/CommentForm.tsx`

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createComment } from '@/app/actions/interaction';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const commentSchema = z.object({
  body: z.string().min(1, '请输入评论内容').max(1000, '评论最多1000个字符'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  contentId: string;
  onSuccess?: () => void;
}

export function CommentForm({ contentId, onSuccess }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const onSubmit = (data: CommentFormValues) => {
    startTransition(async () => {
      const result = await createComment({
        contentId,
        body: data.body,
      });

      if (result.success) {
        form.reset();
        toast.success('评论成功');
        onSuccess?.();
      } else {
        toast.error(result.error || '评论失败');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="写下你的评论..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? '提交中...' : '发表评论'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: 创建评论区组件**

Create: `components/interaction/CommentSection.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getComments, deleteComment } from '@/app/actions/interaction';
import { Comment } from '@/types/api';
import { CommentForm } from './CommentForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface CommentSectionProps {
  contentId: string;
  initialComments?: Comment[];
}

export function CommentSection({ contentId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = async (pageNum: number) => {
    setIsLoading(true);
    const result = await getComments({ contentId, page: pageNum, pageSize: 10 });
    setIsLoading(false);

    if (result.success) {
      if (pageNum === 1) {
        setComments(result.data.items);
      } else {
        setComments((prev) => [...prev, ...result.data.items]);
      }
      setHasMore(result.data.pagination.hasMore);
    }
  };

  useEffect(() => {
    loadComments(1);
  }, [contentId]);

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    const result = await deleteComment({ id: commentId });

    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('删除成功');
    } else {
      toast.error(result.error || '删除失败');
    }
  };

  const handleCommentSuccess = () => {
    loadComments(1);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage);
  };

  return (
    <div className="space-y-6">
      {/* 评论表单 */}
      <CommentForm contentId={contentId} onSuccess={handleCommentSuccess} />

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">
            暂无评论，来写下第一条吧！
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.author.avatar || ''} />
              <AvatarFallback>
                {comment.author.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                {comment.isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? '加载中...' : '加载更多'}
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 提交评论组件**

```bash
git add components/interaction/CommentForm.tsx components/interaction/CommentSection.tsx
git commit -m "feat: add comment form and section components"
```

---

## Summary

完成本计划后，你将拥有：

✅ 评论功能（发表、删除、列表）
✅ 评分功能（1-5星，实时更新平均分）
✅ 收藏功能（收藏/取消收藏）
✅ 乐观更新体验

**下一步**: 实现内容详情页和创建页面（整合所有组件）
