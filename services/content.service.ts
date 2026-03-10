/**
 * 内容服务层
 * 处理内容的 CRUD 操作
 */
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

    const skip = (page - 1) * pageSize
    const take = pageSize

    // 构建查询条件
    const where: any = {
      status: ContentStatus.PUBLISHED,
    }

    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId
    if (authorId) where.authorId = authorId
    if (tagId) {
      where.tags = { some: { tagId } }
    }
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    // 排序
    const orderBy: any = {}
    switch (sort) {
      case 'popular':
        orderBy.viewCount = 'desc'
        break
      case 'rating':
        orderBy.avgRating = 'desc'
        break
      default:
        orderBy.createdAt = 'desc'
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
    ])

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: skip + take < total,
      },
    }
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
    })

    if (!content) return null

    // 获取当前用户的评分和收藏状态
    let userRating = null
    let isCollected = false

    if (userId) {
      const [rating, collection] = await Promise.all([
        prisma.rating.findUnique({
          where: { contentId_userId: { contentId: id, userId } },
        }),
        prisma.collection.findUnique({
          where: { userId_contentId: { userId, contentId: id } },
        }),
      ])
      userRating = rating
      isCollected = !!collection
    }

    return {
      ...content,
      isOwner: content.authorId === userId,
      userRating,
      isCollected,
    }
  }

  /**
   * 创建内容
   */
  async create(data: CreateContentData, authorId: string) {
    const { tagIds, fileIds, ...contentData } = data

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
    })

    return content
  }

  /**
   * 更新内容
   */
  async update(id: string, data: Partial<CreateContentData>) {
    const { tagIds, fileIds, ...contentData } = data

    // 更新标签
    if (tagIds) {
      await prisma.contentTag.deleteMany({ where: { contentId: id } })
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
    })

    // 清除缓存
    await invalidateCache(`${ContentService.CACHE_PREFIX}detail:${id}`)

    return content
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
    })

    await invalidateCache(`${ContentService.CACHE_PREFIX}detail:${id}`)
    return content
  }

  /**
   * 删除内容
   */
  async delete(id: string) {
    await prisma.content.delete({ where: { id } })
    await invalidateCache(`${ContentService.CACHE_PREFIX}detail:${id}`)
  }

  /**
   * 增加浏览计数
   */
  async incrementViewCount(id: string) {
    await prisma.content.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
  }

  /**
   * 重新计算评分
   */
  async recalculateRating(contentId: string) {
    const result = await prisma.rating.aggregate({
      where: { contentId },
      _avg: { score: true },
      _count: true,
    })

    await prisma.content.update({
      where: { id: contentId },
      data: {
        avgRating: result._avg.score,
        ratingCount: result._count,
      },
    })
  }

  /**
   * 获取首页数据
   */
  async getHomeData() {
    const cacheKey = `${ContentService.CACHE_PREFIX}home`

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
        ])

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
        }
      },
      300 // 5分钟缓存
    )
  }

  private getListInclude() {
    return {
      author: { select: { id: true, name: true, avatar: true } },
      category: { select: { id: true, name: true, icon: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      _count: { select: { comments: true, ratings: true } },
    }
  }
}

export const contentService = new ContentService()
