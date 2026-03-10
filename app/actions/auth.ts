'use server';

import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/validators';
import bcrypt from 'bcryptjs';
import { auth, signIn } from '@/lib/auth';
import { ApiResponse, CurrentUser } from '@/types/api';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  name: string;
}

export async function register(
  input: RegisterInput
): Promise<ApiResponse<RegisterResponse>> {
  // 验证输入
  const validated = registerSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: '参数验证失败',
      code: 'VALIDATION_ERROR',
      details: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password, name } = validated.data;

  // 检查邮箱是否已存在
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return {
      success: false,
      error: '该邮箱已被注册',
      code: 'CONFLICT',
    };
  }

  // 创建用户
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'USER',
    },
  });

  // 自动登录
  await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export async function getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '未登录',
      code: 'UNAUTHORIZED',
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          contents: true,
          collections: true,
        },
      },
    },
  });

  if (!user) {
    return {
      success: false,
      error: '用户不存在',
      code: 'NOT_FOUND',
    };
  }

  return {
    success: true,
    data: {
      ...user,
      stats: {
        contentsCount: user._count.contents,
        collectionsCount: user._count.collections,
      },
    },
  };
}
