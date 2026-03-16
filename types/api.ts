/**
 * SuperMart API 类型定义
 * 用于 Server Actions 的请求/响应类型
 */

// ============================================
// 通用类型
// ============================================

/**
 * API 统一响应格式 - 成功
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API 统一响应格式 - 错误
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: ErrorCode;
  details?: Record<string, string[]>;
}

/**
 * API 统一响应格式
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * 错误代码
 */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// ============================================
// 用户类型
// ============================================

export type UserRole = 'USER' | 'ADMIN';

/**
 * 用户基础信息
 */
export interface UserBase {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
}

/**
 * 当前用户详情
 */
export interface CurrentUser extends UserBase {
  bio: string | null;
  createdAt: string;
  stats: {
    contentsCount: number;
    collectionsCount: number;
  };
}

// ============================================
// 内容类型
// ============================================

export type ContentType = 'SKILL';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/**
 * 分类
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  contentsCount?: number;
}

/**
 * 标签
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  contentsCount?: number;
}

/**
 * 内容列表项（精简）
 */
export interface ContentListItem {
  id: string;
  name: string;
  description: string;
  version: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: Category;
  tags: Tag[];
  avgRating: number | null;
  ratingCount: number;
  viewCount: number;
  downloadCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  isCollected?: boolean;  // 当前用户是否收藏
  createdAt: string;
  updatedAt: string;
}

/**
 * 工具配置
 */
export interface ToolsConfig {
  tools: Array<{
    name: string;
    description?: string;
    config?: Record<string, unknown>;
  }>;
  apis?: Array<{
    name: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
  }>;
}

/**
 * 内容详情
 */
export interface ContentDetail extends ContentListItem {
  content: string | null;
  versionNotes: string | null;
  toolsConfig: ToolsConfig | null;
  status: ContentStatus;
  license: string;
  publishedAt: string | null;
  files: ContentFile[];
  isOwner: boolean;  // 当前用户是否是作者
}

/**
 * 内容文件
 */
export interface ContentFile {
  id: string;
  filename: string;
  path: string;
  fileContent?: string | null;
  type: string;
  size: number;
  createdAt: string;
}

// ============================================
// 互动类型
// ============================================

/**
 * 评论
 */
export interface Comment {
  id: string;
  body: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 评分
 */
export interface Rating {
  id: string;
  score: number;  // 1-5
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 请求参数类型
// ============================================

// --- 认证 ---
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// --- 内容 ---
export interface GetContentsInput {
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  query?: string;
  sort?: 'latest' | 'popular' | 'rating';
  page?: number;
  pageSize?: number;
}

export interface CreateContentInput {
  name: string;
  description: string;
  version?: string;
  versionNotes?: string;
  categoryId: string;
  content?: string;
  toolsConfig?: ToolsConfig;
  tagIds?: string[];
  fileIds?: string[];
  license?: string;
  isDraft?: boolean;
}

export interface UpdateContentInput {
  name?: string;
  description?: string;
  version?: string;
  versionNotes?: string;
  categoryId?: string;
  content?: string;
  toolsConfig?: ToolsConfig;
  tagIds?: string[];
  fileIds?: string[];
  license?: string;
}

// --- 互动 ---
export interface GetCommentsInput {
  contentId: string;
  page?: number;
  pageSize?: number;
}

export interface CreateCommentInput {
  contentId: string;
  body: string;
}

export interface RatingInput {
  contentId: string;
  score: number;  // 1-5
}

export interface ToggleCollectionInput {
  contentId: string;
}

// --- 搜索 ---
export interface SearchContentsInput {
  query: string;
  categoryId?: string;
  sort?: 'relevance' | 'latest' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface GetSearchSuggestionsInput {
  query: string;
  limit?: number;
}

// --- 文件 ---
export interface GetUploadUrlInput {
  filename: string;
  type: string;
  size: number;
}

export interface ConfirmUploadInput {
  fileKey: string;
  filename: string;
  type: string;
  size: number;
}

// --- 元数据 ---
export interface GetPopularTagsInput {
  limit?: number;
}

// ============================================
// 响应数据类型
// ============================================

// --- 认证 ---
export interface RegisterResponse {
  user: UserBase;
}

export interface LoginResponse {
  user: UserBase;
}

// --- 内容 ---
export interface CreateContentResponse {
  id: string;
  name: string;
  status: ContentStatus;
}

export interface SearchResponse {
  items: ContentListItem[];
  pagination: PaginationInfo;
  query: string;
  took: number;
}

// --- 互动 ---
export interface ToggleCollectionResponse {
  collected: boolean;
}

// --- 搜索 ---
export interface SearchSuggestion {
  text: string;
  type: 'keyword' | 'content' | 'author' | 'category';
}

// --- 文件 ---
export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface ConfirmUploadResponse {
  id: string;
  url: string;
}

// --- 首页 ---
export interface HomeData {
  featured: ContentListItem[];
  latest: ContentListItem[];
  popular: ContentListItem[];
  categories: Category[];
  stats: {
    totalContents: number;
    totalUsers: number;
    totalCategories: number;
  };
}
