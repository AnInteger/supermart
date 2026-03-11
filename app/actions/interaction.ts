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
import { ContentStatus } from '@prisma/client';

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
          user: {
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
          author: {
            id: c.user.id,
            name: c.user.name || '',
            avatar: c.user.avatar,
          },
          isOwner: userId === c.userId,
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
        userId: session.user.id,
        body,
      },
      include: {
        user: {
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
        author: {
          id: comment.user.id,
          name: comment.user.name || '',
          avatar: comment.user.avatar,
        },
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
      select: { userId: true, contentId: true },
    });

    if (!comment) {
      return { success: false, error: '评论不存在', code: 'NOT_FOUND' };
    }

    if (comment.userId !== session.user.id) {
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
