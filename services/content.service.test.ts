/**
 * ContentService 单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentService } from './content.service';

import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    content: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
  },
}));

// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
    keys: vi.fn(),
    del: vi.fn(),
  },
  cache: vi.fn(async (_key: string, fetcher: () => Promise<any>) => fetcher()),
  invalidateCache: vi.fn(),
}));

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ContentService();
  });

  describe('getList', () => {
    it('should return paginated content list', async () => {
      const mockContents = [
        {
          id: '1',
          name: 'Test Skill',
          description: 'Test description',
          status: 'PUBLISHED',
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.content.findMany).mockResolvedValue(mockContents);
      vi.mocked(prisma.content.count).mockResolvedValue(1);

      const result = await service.getList({ page: 1, pageSize: 12 });
      expect(result.items).toEqual(mockContents);
      expect(result.pagination.total).toBe(1);
    });
  });
});
