'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { ApiResponse } from '@/types/api';

interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatar?: string;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ApiResponse<{ id: string; name: string; bio: string | null; avatar: string | null }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '未登录',
      code: 'UNAUTHORIZED',
    };
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: input.name,
      bio: input.bio,
      avatar: input.avatar,
    },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
    },
  });

  return {
    success: true,
    data: user,
  };
}

export async function updateAIConfig(
  config: Record<string, unknown>
): Promise<ApiResponse<{ success: boolean }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '未登录',
      code: 'UNAUTHORIZED',
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { aiConfig: config },
  });

  return {
    success: true,
    data: { success: true },
  };
}
