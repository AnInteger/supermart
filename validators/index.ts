/**
 * SuperMart Zod 验证规则
 * 用于 Server Actions 参数验证
 */

import { z } from 'zod';

// ============================================
// 常量
// ============================================

/** 允许的文件类型 */
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'application/javascript',
  'text/javascript',
  'text/x-python',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
] as const;

/** 最大文件大小：10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ============================================
// 认证相关
// ============================================

/** 注册验证 */
export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少8个字符')
    .regex(/[A-Z]/, '密码需包含大写字母')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/[0-9]/, '密码需包含数字'),
  name: z
    .string()
    .min(2, '昵称至少2个字符')
    .max(20, '昵称最多20个字符'),
});

/** 登录验证 */
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

// ============================================
// 内容相关
// ============================================

/** 获取内容列表验证 */
export const getContentsSchema = z.object({
  type: z.enum(['SKILL', 'AGENT']).optional(),
  categoryId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
  authorId: z.string().cuid().optional(),
  query: z.string().max(100).optional(),
  sort: z.enum(['latest', 'popular', 'rating']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

/** 工具配置验证 */
export const toolsConfigSchema = z.object({
  tools: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      config: z.record(z.string(), z.unknown()).optional(),
    })
  ),
  apis: z
    .array(
      z.object({
        name: z.string(),
        endpoint: z.string().url(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
        headers: z.record(z.string(), z.string()).optional(),
      })
    )
    .optional(),
});

/** 创建内容验证 */
export const createContentSchema = z.object({
  type: z.enum(['SKILL', 'AGENT']),
  name: z.string().min(3, '名称至少3个字符').max(100, '名称最多100个字符'),
  description: z.string().min(10, '描述至少10个字符').max(500, '描述最多500个字符'),
  categoryId: z.string().cuid('请选择分类'),

  instruction: z.string().max(10000).optional(),
  toolsConfig: toolsConfigSchema.optional(),
  setupGuide: z.string().max(10000).optional(),
  examples: z.string().max(10000).optional(),

  tagIds: z.array(z.string().cuid()).max(5, '最多5个标签').optional(),
  fileIds: z.array(z.string().cuid()).max(10, '最多10个文件').optional(),

  isDraft: z.boolean().default(true),
});

/** 更新内容验证 */
export const updateContentSchema = createContentSchema.partial().extend({
  id: z.string().cuid(),
});

/** 发布内容验证 */
export const publishContentSchema = z.object({
  id: z.string().cuid(),
});

/** 删除内容验证 */
export const deleteContentSchema = z.object({
  id: z.string().cuid(),
});

/** 获取我的内容验证 */
export const getMyContentsSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// ============================================
// 互动相关
// ============================================

/** 获取评论验证 */
export const getCommentsSchema = z.object({
  contentId: z.string().cuid(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

/** 创建评论验证 */
export const createCommentSchema = z.object({
  contentId: z.string().cuid(),
  body: z.string().min(1, '评论不能为空').max(1000, '评论最多1000个字符'),
});

/** 删除评论验证 */
export const deleteCommentSchema = z.object({
  id: z.string().cuid(),
});

/** 评分验证 */
export const rateContentSchema = z.object({
  contentId: z.string().cuid(),
  score: z.number().int().min(1).max(5),
});

/** 收藏验证 */
export const toggleCollectionSchema = z.object({
  contentId: z.string().cuid(),
});

/** 获取我的收藏验证 */
export const getMyCollectionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// ============================================
// 搜索相关
// ============================================

/** 搜索验证 */
export const searchContentsSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['SKILL', 'AGENT']).optional(),
  categoryId: z.string().cuid().optional(),
  sort: z.enum(['relevance', 'latest', 'popular']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

/** 搜索建议验证 */
export const getSearchSuggestionsSchema = z.object({
  query: z.string().min(1).max(50),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

// ============================================
// 文件相关
// ============================================

/** 获取上传URL验证 */
export const getUploadUrlSchema = z.object({
  filename: z.string().max(255),
  type: z.string().refine((val) => ALLOWED_FILE_TYPES.includes(val as any), {
    message: '不支持的文件类型',
  }),
  size: z.number().int().max(MAX_FILE_SIZE, '文件最大10MB'),
});

/** 确认上传验证 */
export const confirmUploadSchema = z.object({
  fileKey: z.string(),
  filename: z.string().max(255),
  type: z.string(),
  size: z.number().int(),
});

// ============================================
// 元数据相关
// ============================================

/** 获取热门标签验证 */
export const getPopularTagsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
