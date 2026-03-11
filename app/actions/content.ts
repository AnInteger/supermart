'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { contentService } from '@/services/content.service';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { getContentsSchema } from '@/validators';
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
    }
  } catch (error) {
    console.error('Get contents error:', error)
    return {
      success: false,
      error: '获取内容列表失败'
      code: 'INTERNAL_error',
    }
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
        code: 'NOT_found',
      }
    }
    // 增加浏览计数（仅发布状态）
    if (content.status === ContentStatus.PUBLISHED) {
      await contentService.incrementViewCount(id)
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
      }
    }
  } catch (error) {
    console.error('Get content error:', error)
    return {
      success: false,
      error: '获取内容详情失败'
      code: 'internal_error',
    }
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
      code: 'unauthorized',
    };
  }

  const validated = createContentSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
      details: validated.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const content = await contentService.create(validated.data, session.user.id)
    revalidatePath('/explore')
    return {
      success: true,
      data: {
        id: content.id,
        name: content.name,
        status: content.status,
      }
    }
  } catch (error) {
    console.error('Create content error:', error)
    return {
      success: false,
      error: '创建内容失败',
      code: 'internal_error',
    }
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
      code: 'unauthorized',
    }
  }

  // 检查权限
  const existing = await contentService.getById(id, session.user.id)
  if (!existing || !existing.isOwner) {
    return {
      success: false,
      error: '无权编辑此内容',
      code: 'forbidden',
    }
  }

  const validated = updateContentSchema.safeParse({ ...data, id })
  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    const content = await contentService.update(id, validated.data)
    revalidatePath(`/content/${id}`)
    revalidatePath('/explore')
    return {
      success: true,
      data: {
        id: content.id,
        name: content.name,
      }
    }
  } catch (error) {
    console.error('Update content error:', error)
    return {
      success: false,
      error: '更新内容失败',
      code: 'internal_error',
    }
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
      code: 'unauthorized',
    }
  }

  const existing = await contentService.getById(id, session.user.id)
  if (!existing || !existing.isOwner) {
    return {
      success: false,
      error: '无权发布此内容',
      code: 'forbidden',
    }
  }

  try {
    const content = await contentService.publish(id)
    revalidatePath(`/content/${id}`)
    revalidatePath('/explore')
    return {
      success: true,
      data: {
        id: content.id,
        status: content.status,
      }
    }
  } catch (error) {
    console.error('Publish content error:', error)
    return {
      success: false,
      error: '发布内容失败',
      code: 'internal_error',
    }
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
      code: 'unauthorized',
    }
  }

  const existing = await contentService.getById(id, session.user.id)
  if (!existing || !existing.isOwner) {
    return {
      success: false,
      error: '无权删除此内容',
      code: 'forbidden',
    }
  }

  try {
    await contentService.delete(id)
    revalidatePath('/explore')
    return {
      success: true,
      data: { success: true },
    }
  } catch (error) {
    console.error('Delete content error:', error)
    return {
      success: false,
      error: '删除内容失败',
      code: 'internal_error',
    }
  }
}

/**
 * 获取我的内容
 */
export async function getMyContents(
  params: Record<string, unknown>
): Promise<ApiResponse<PaginatedResponse<ContentListItem>>> {
 {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: '请先登录',
      code: 'unauthorized',
    }
  }

  const result = await contentService.getList({
    ...params,
    authorId: session.user.id,
  })
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
      }),
      pagination: result.pagination,
    }
  }
}

/**
 * 获取首页数据
 */
export async function getHomeData() {
  try {
    const data = await contentService.getHomeData()
    return { success: true, data }
  } catch (error) {
    console.error('Get home data error:', error)
    return { success: false, error: '获取首页数据失败' }
  }
}
