/**
 * 认证 Server Actions 测试
 * 测试 register 和 getCurrentUser 函数
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 使用 vi.hoisted 在 mock 提升前定义 mock 对象
const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const mockAuth = vi.hoisted(() => vi.fn());
const mockSignIn = vi.hoisted(() => vi.fn());

// Mock @/lib/prisma before importing auth.ts
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth module
vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
  signIn: mockSignIn,
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$hashed_password'),
  },
}));

// Import after mocks are set up
import { register, getCurrentUser } from './auth';

describe('register Server Action', () => {
  const mockUser = {
    id: 'clx123456789',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('参数验证', () => {
    it('应该拒绝无效邮箱', async () => {
      const result = await register({
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('应该拒绝短密码（少于8位）', async () => {
      const result = await register({
        email: 'test@example.com',
        password: 'Pass',
        name: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('应该拒绝短昵称（少于2个字符）', async () => {
      const result = await register({
        email: 'test@example.com',
        password: 'Password123',
        name: 'T',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('应该拒绝长昵称（超过20个字符）', async () => {
      const result = await register({
        email: 'test@example.com',
        password: 'Password123',
        name: 'This is a very long nickname that exceeds the limit',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('注册逻辑', () => {
    it('应该检查邮箱是否已被注册', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValueOnce({
        ...mockUser,
        password: 'hashed',
        avatar: null,
        bio: null,
        aiConfig: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await register({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('CONFLICT');
      expect(result.error).toBe('该邮箱已被注册');
    });

    it('应该成功注册新用户', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValueOnce({
        ...mockUser,
        password: '$hashed_password',
        avatar: null,
        bio: null,
        aiConfig: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await register({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
      expect(result.data!.email).toBe('test@example.com');
      expect(result.data!.name).toBe('Test User');
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'Password123',
        redirect: false,
      });
    });
  });
});

describe('getCurrentUser Server Action', () => {
  const mockSessionUser = {
    user: {
      id: 'clx123456789',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    },
    expires: new Date(Date.now() + 86400000),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该拒绝未登录用户', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const result = await getCurrentUser();

    expect(result.success).toBe(false);
    expect(result.code).toBe('UNAUTHORIZED');
    expect(result.error).toBe('未登录');
  });

  it('应该返回当前用户信息', async () => {
    mockAuth.mockResolvedValueOnce(mockSessionUser);
    vi.mocked(mockPrisma.user.findUnique).mockResolvedValueOnce({
      id: 'clx123456789',
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      bio: 'Test bio',
      role: 'USER',
      createdAt: new Date(),
      _count: {
        contents: 5,
        collections: 10,
      },
    });

    const result = await getCurrentUser();

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      id: 'clx123456789',
      email: 'test@example.com',
      name: 'Test User',
      stats: {
        contentsCount: 5,
        collectionsCount: 10,
      },
    });
  });

  it('应该处理用户不存在的异常情况', async () => {
    mockAuth.mockResolvedValueOnce(mockSessionUser);
    vi.mocked(mockPrisma.user.findUnique).mockResolvedValueOnce(null);

    const result = await getCurrentUser();

    expect(result.success).toBe(false);
    expect(result.code).toBe('NOT_FOUND');
    expect(result.error).toBe('用户不存在');
  });
});
