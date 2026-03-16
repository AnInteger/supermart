/**
 * 内容 Server Actions 测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getContents, getContent, createContent, deleteContent } from './content';

import { contentService } from '@/services/content.service';
import { auth } from '@/lib/auth';

// Mock dependencies
vi.mock('@/services/content.service', () => ({
  contentService: {
    getList: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    incrementViewCount: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Content Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getContents', () => {
    it('should return paginated content list', async () => {
      const mockContents = {
        items: [
          {
            id: '1',
            name: 'Test Skill',
            description: 'Test description',
            version: 'v1.0.0',
            author: { id: 'u1', name: 'User', avatar: null },
            category: { id: 'c1', name: 'Category', slug: 'category', icon: null },
            tags: [],
            avgRating: 4.5,
            ratingCount: 10,
            viewCount: 100,
            downloadCount: 50,
            favoriteCount: 20,
            isFeatured: false,
            isCollected: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1, hasMore: false },
      }

      vi.mocked(contentService.getList).mockResolvedValue(mockContents)
      const result = await getContents({ page: 1, pageSize: 12 })
      expect(result.success).toBe(true)
    })
  })

  describe('getContent', () => {
    it('should return content detail', async () => {
      const mockContent = {
        id: '1',
        name: 'Test Skill',
        description: 'Test description',
        content: 'Test instruction',
        version: 'v1.0.0',
        versionNotes: null,
        status: 'PUBLISHED',
        license: 'MIT-0',
        author: { id: 'u1', name: 'User' },
        category: { id: 'c1', name: 'Category' },
        tags: [],
        files: [],
        avgRating: 4.5,
        viewCount: 100,
        downloadCount: 50,
        favoriteCount: 20,
        isOwner: false,
        userRating: null,
        isCollected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { comments: 5, ratings: 10 },
      }
      vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } })
      vi.mocked(contentService.getById).mockResolvedValue(mockContent)
      vi.mocked(contentService.incrementViewCount).mockResolvedValue(undefined)
      const result = await getContent('1')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test Skill',
        })
      )
    })
  })

  describe('createContent', () => {
    it('should create content when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } })
      vi.mocked(contentService.create).mockResolvedValue({
        id: '1',
        name: 'Test Skill',
        status: 'DRAFT',
      })
      const result = await createContent({
        name: 'Test Skill',
        description: 'Test description',
        categoryId: 'c1',
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test Skill',
        })
      )
    })
  })

  describe('deleteContent', () => {
    it('should delete content when owner', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } })
      vi.mocked(contentService.getById).mockResolvedValue({ isOwner: true })
      vi.mocked(contentService.delete).mockResolvedValue(undefined)
      const result = await deleteContent('1')
      expect(result.success).toBe(true)
    })
  })
})
