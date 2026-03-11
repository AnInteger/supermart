'use server';

import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types/api';
import { ContentStatus } from '@prisma/client';

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  slug: string | null;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  _count?: { contents: number };
}>>> {
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
        description: null,
        sortOrder: c.sortOrder,
        _count: {
          contents: c._count.contents,
        },
      })),
    };
  } catch (error) {
    console.error('Get categories error:', error);
    return {
      success: false,
      error: '获取分类失败',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * 获取所有标签
 */
export async function getTags(): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  slug: string;
  _count?: { contents: number };
}>>> {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            contents: true,
          },
        },
      },
    });

    return {
      success: true,
      data: tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        _count: {
          contents: t._count.contents,
        },
      })),
    };
  } catch (error) {
    console.error('Get tags error:', error);
    return {
      success: false,
      error: '获取标签失败',
      code: 'INTERNAL_ERROR',
    };
  }
}
