# SuperMart API 接口设计文档

> 创建日期：2026-03-10
> 版本：v1.0

## 一、设计规范

### 1.1 响应格式

所有 Server Actions 返回统一格式：

```typescript
// 成功响应
type SuccessResponse<T> = {
  success: true;
  data: T;
}

// 错误响应
type ErrorResponse = {
  success: false;
  error: string;      // 错误消息（可展示给用户）
  code?: string;      // 错误代码（用于前端处理）
  details?: Record<string, string[]>;  // 验证错误详情
}

// 联合类型
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
```

### 1.2 错误代码

| 代码 | 含义 | HTTP类比 |
|------|------|----------|
| `UNAUTHORIZED` | 未登录 | 401 |
| `FORBIDDEN` | 无权限 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `VALIDATION_ERROR` | 参数验证失败 | 400 |
| `CONFLICT` | 资源冲突（如重复） | 409 |
| `INTERNAL_ERROR` | 服务器内部错误 | 500 |

### 1.3 分页格式

```typescript
type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;      // 当前页码（从1开始）
    pageSize: number;  // 每页数量
    total: number;     // 总记录数
    totalPages: number; // 总页数
    hasMore: boolean;  // 是否有下一页
  }
}
```

---

## 二、认证相关 API

### 2.1 注册

```typescript
// ==================== 注册 ====================

// 请求参数
interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// Zod 验证
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string()
    .min(8, '密码至少8个字符')
    .regex(/[A-Z]/, '密码需包含大写字母')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/[0-9]/, '密码需包含数字'),
  name: z.string()
    .min(2, '昵称至少2个字符')
    .max(20, '昵称最多20个字符'),
});

// 响应
interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Server Action
async function register(input: RegisterInput): Promise<ApiResponse<RegisterResponse>>
```

### 2.2 登录

```typescript
// ==================== 登录 ====================

// 请求参数
interface LoginInput {
  email: string;
  password: string;
}

// Zod 验证
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

// 响应
interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: 'USER' | 'ADMIN';
  };
}

// Server Action
async function login(input: LoginInput): Promise<ApiResponse<LoginResponse>>
```

### 2.3 登出

```typescript
// ==================== 登出 ====================

// 无参数
async function logout(): Promise<ApiResponse<{ message: string }>>
```

### 2.4 获取当前用户

```typescript
// ==================== 获取当前用户 ====================

// 无参数，从 session 获取
// 响应
interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  stats: {
    contentsCount: number;     // 创建的内容数
    collectionsCount: number;  // 收藏数
  };
}

async function getCurrentUser(): Promise<ApiResponse<CurrentUserResponse>>
```

---

## 三、内容相关 API

### 3.1 获取内容列表

```typescript
// ==================== 获取内容列表 ====================

// 请求参数
interface GetContentsInput {
  type?: 'SKILL' | 'AGENT';
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  query?: string;        // 搜索关键词
  sort?: 'latest' | 'popular' | 'rating';
  page?: number;         // 默认 1
  pageSize?: number;     // 默认 12，最大 50
}

// Zod 验证
const getContentsSchema = z.object({
  type: z.enum(['SKILL', 'AGENT']).optional(),
  categoryId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
  authorId: z.string().cuid().optional(),
  query: z.string().max(100).optional(),
  sort: z.enum(['latest', 'popular', 'rating']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// 响应（列表项，精简字段）
interface ContentListItem {
  id: string;
  type: 'SKILL' | 'AGENT';
  name: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  avgRating: number | null;
  ratingCount: number;
  viewCount: number;
  isFeatured: boolean;
  createdAt: string;
  publishedAt: string | null;
}

// Server Action
async function getContents(
  input: GetContentsInput
): Promise<ApiResponse<PaginatedResponse<ContentListItem>>>
```

### 3.2 获取内容详情

```typescript
// ==================== 获取内容详情 ====================

// 请求参数
interface GetContentInput {
  id: string;
}

// Zod 验证
const getContentSchema = z.object({
  id: z.string().cuid('无效的内容ID'),
});

// 响应
interface ContentDetail {
  id: string;
  type: 'SKILL' | 'AGENT';
  name: string;
  description: string;

  // 核心内容
  instruction: string | null;      // 操作指令（Markdown）
  toolsConfig: ToolsConfig | null; // 工具配置
  setupGuide: string | null;       // 设置指南（Markdown）
  examples: string | null;         // 使用案例（Markdown）

  // 作者信息
  author: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    contentsCount: number;
  };

  // 分类标签
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  // 附件文件
  files: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
  }>;

  // 统计
  avgRating: number | null;
  ratingCount: number;
  viewCount: number;
  downloadCount: number;

  // 当前用户状态（需登录）
  userInteraction?: {
    isCollected: boolean;     // 是否已收藏
    userRating: number | null; // 用户评分（1-5）
  };

  // 时间
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string;
}

// 工具配置类型
interface ToolsConfig {
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

// Server Action
async function getContent(
  input: GetContentInput
): Promise<ApiResponse<ContentDetail>>
```

### 3.3 创建内容

```typescript
// ==================== 创建内容 ====================

// 请求参数
interface CreateContentInput {
  type: 'SKILL' | 'AGENT';
  name: string;
  description: string;
  categoryId: string;

  // 核心内容（可选，可分步填写）
  instruction?: string;
  toolsConfig?: ToolsConfig;
  setupGuide?: string;
  examples?: string;

  // 标签
  tagIds?: string[];

  // 文件（已上传的文件ID）
  fileIds?: string[];

  // 发布选项
  isDraft?: boolean;  // true=保存草稿，false=直接发布
}

// Zod 验证
const createContentSchema = z.object({
  type: z.enum(['SKILL', 'AGENT']),
  name: z.string()
    .min(3, '名称至少3个字符')
    .max(100, '名称最多100个字符'),
  description: z.string()
    .min(10, '描述至少10个字符')
    .max(500, '描述最多500个字符'),
  categoryId: z.string().cuid('请选择分类'),

  instruction: z.string().max(10000).optional(),
  toolsConfig: z.object({
    tools: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      config: z.record(z.unknown()).optional(),
    })),
    apis: z.array(z.object({
      name: z.string(),
      endpoint: z.string().url(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
      headers: z.record(z.string()).optional(),
    })).optional(),
  }).optional(),
  setupGuide: z.string().max(10000).optional(),
  examples: z.string().max(10000).optional(),

  tagIds: z.array(z.string().cuid()).max(5, '最多5个标签').optional(),
  fileIds: z.array(z.string().cuid()).max(10, '最多10个文件').optional(),

  isDraft: z.boolean().default(true),
});

// 响应
interface CreateContentResponse {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED';
}

// Server Action
async function createContent(
  input: CreateContentInput
): Promise<ApiResponse<CreateContentResponse>>
```

### 3.4 更新内容

```typescript
// ==================== 更新内容 ====================

// 请求参数（所有字段可选，只更新传入的字段）
interface UpdateContentInput {
  id: string;
  name?: string;
  description?: string;
  categoryId?: string;
  instruction?: string;
  toolsConfig?: ToolsConfig;
  setupGuide?: string;
  examples?: string;
  tagIds?: string[];
  fileIds?: string[];
}

// Zod 验证
const updateContentSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  categoryId: z.string().cuid().optional(),
  instruction: z.string().max(10000).optional(),
  toolsConfig: createContentSchema.shape.toolsConfig.optional(),
  setupGuide: z.string().max(10000).optional(),
  examples: z.string().max(10000).optional(),
  tagIds: z.array(z.string().cuid()).max(5).optional(),
  fileIds: z.array(z.string().cuid()).max(10).optional(),
});

// 响应
interface UpdateContentResponse {
  id: string;
  updatedAt: string;
}

// Server Action
async function updateContent(
  input: UpdateContentInput
): Promise<ApiResponse<UpdateContentResponse>>
```

### 3.5 发布内容

```typescript
// ==================== 发布内容（草稿 -> 发布） ====================

// 请求参数
interface PublishContentInput {
  id: string;
}

// Zod 验证
const publishContentSchema = z.object({
  id: z.string().cuid(),
});

// 发布前检查
interface PublishCheck {
  hasName: boolean;
  hasDescription: boolean;
  hasInstruction: boolean;  // 至少需要有指令
}

// 响应
interface PublishContentResponse {
  id: string;
  status: 'PUBLISHED';
  publishedAt: string;
}

// Server Action
async function publishContent(
  input: PublishContentInput
): Promise<ApiResponse<PublishContentResponse>>
```

### 3.6 删除内容

```typescript
// ==================== 删除内容 ====================

// 请求参数
interface DeleteContentInput {
  id: string;
}

// Zod 验证
const deleteContentSchema = z.object({
  id: z.string().cuid(),
});

// 响应
interface DeleteContentResponse {
  message: string;
}

// Server Action
async function deleteContent(
  input: DeleteContentInput
): Promise<ApiResponse<DeleteContentResponse>>
```

### 3.7 获取我的内容

```typescript
// ==================== 获取当前用户创建的内容 ====================

// 请求参数
interface GetMyContentsInput {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  page?: number;
  pageSize?: number;
}

// Zod 验证
const getMyContentsSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// 响应（同 getContents 列表项）
async function getMyContents(
  input: GetMyContentsInput
): Promise<ApiResponse<PaginatedResponse<ContentListItem>>>
```

---

## 四、互动相关 API

### 4.1 获取评论列表

```typescript
// ==================== 获取评论列表 ====================

// 请求参数
interface GetCommentsInput {
  contentId: string;
  page?: number;
  pageSize?: number;
}

// Zod 验证
const getCommentsSchema = z.object({
  contentId: z.string().cuid(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

// 响应
interface Comment {
  id: string;
  body: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  isOwner: boolean;  // 当前用户是否是评论作者
  createdAt: string;
  updatedAt: string;
}

// Server Action
async function getComments(
  input: GetCommentsInput
): Promise<ApiResponse<PaginatedResponse<Comment>>>
```

### 4.2 创建评论

```typescript
// ==================== 创建评论 ====================

// 请求参数
interface CreateCommentInput {
  contentId: string;
  body: string;
}

// Zod 验证
const createCommentSchema = z.object({
  contentId: z.string().cuid(),
  body: z.string()
    .min(1, '评论不能为空')
    .max(1000, '评论最多1000个字符'),
});

// 响应
interface CreateCommentResponse {
  id: string;
  body: string;
  createdAt: string;
}

// Server Action
async function createComment(
  input: CreateCommentInput
): Promise<ApiResponse<CreateCommentResponse>>
```

### 4.3 删除评论

```typescript
// ==================== 删除评论 ====================

// 请求参数
interface DeleteCommentInput {
  id: string;
}

// Zod 验证
const deleteCommentSchema = z.object({
  id: z.string().cuid(),
});

// Server Action
async function deleteComment(
  input: DeleteCommentInput
): Promise<ApiResponse<{ message: string }>>
```

### 4.4 提交评分

```typescript
// ==================== 提交/更新评分 ====================

// 请求参数
interface RateContentInput {
  contentId: string;
  score: number;  // 1-5
}

// Zod 验证
const rateContentSchema = z.object({
  contentId: z.string().cuid(),
  score: z.number().int().min(1, '评分最低为1星').max(5, '评分最高为5星'),
});

// 响应
interface RateContentResponse {
  score: number;
  avgRating: number;     // 更新后的平均评分
  ratingCount: number;   // 更新后的评分数量
}

// Server Action
async function rateContent(
  input: RateContentInput
): Promise<ApiResponse<RateContentResponse>>
```

### 4.5 收藏/取消收藏

```typescript
// ==================== 收藏/取消收藏（切换） ====================

// 请求参数
interface ToggleCollectionInput {
  contentId: string;
}

// Zod 验证
const toggleCollectionSchema = z.object({
  contentId: z.string().cuid(),
});

// 响应
interface ToggleCollectionResponse {
  isCollected: boolean;  // 操作后的状态
  collectionsCount: number;  // 该用户的收藏总数
}

// Server Action
async function toggleCollection(
  input: ToggleCollectionInput
): Promise<ApiResponse<ToggleCollectionResponse>>
```

### 4.6 获取我的收藏

```typescript
// ==================== 获取我的收藏列表 ====================

// 请求参数
interface GetMyCollectionsInput {
  page?: number;
  pageSize?: number;
}

// Zod 验证
const getMyCollectionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// 响应（内容列表 + 收藏时间）
interface CollectionItem extends ContentListItem {
  collectedAt: string;
}

async function getMyCollections(
  input: GetMyCollectionsInput
): Promise<ApiResponse<PaginatedResponse<CollectionItem>>>
```

---

## 五、搜索相关 API

### 5.1 搜索内容

```typescript
// ==================== 搜索内容 ====================

// 请求参数
interface SearchContentsInput {
  query: string;
  type?: 'SKILL' | 'AGENT';
  categoryId?: string;
  sort?: 'relevance' | 'latest' | 'popular';
  page?: number;
  pageSize?: number;
}

// Zod 验证
const searchContentsSchema = z.object({
  query: z.string().min(1, '请输入搜索关键词').max(100),
  type: z.enum(['SKILL', 'AGENT']).optional(),
  categoryId: z.string().cuid().optional(),
  sort: z.enum(['relevance', 'latest', 'popular']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// 响应
interface SearchResult {
  items: ContentListItem[];
  pagination: PaginationInfo;
  query: string;
  took: number;  // 搜索耗时(ms)
}

// Server Action
async function searchContents(
  input: SearchContentsInput
): Promise<ApiResponse<SearchResult>>
```

### 5.2 搜索建议（自动补全）

```typescript
// ==================== 搜索建议 ====================

// 请求参数
interface GetSearchSuggestionsInput {
  query: string;
  limit?: number;  // 默认 5
}

// Zod 验证
const getSearchSuggestionsSchema = z.object({
  query: z.string().min(1).max(50),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

// 响应
interface SearchSuggestion {
  text: string;
  type: 'keyword' | 'content' | 'author' | 'category';
}

async function getSearchSuggestions(
  input: GetSearchSuggestionsInput
): Promise<ApiResponse<SearchSuggestion[]>>
```

---

## 六、文件上传 API

### 6.1 获取上传凭证

```typescript
// ==================== 获取上传凭证（直传R2） ====================

// 请求参数
interface GetUploadUrlInput {
  filename: string;
  type: string;    // MIME type
  size: number;    // 文件大小（字节）
}

// Zod 验证
const getUploadUrlSchema = z.object({
  filename: z.string().max(255),
  type: z.string().refine(
    (val) => ALLOWED_FILE_TYPES.includes(val),
    { message: '不支持的文件类型' }
  ),
  size: z.number().int().max(10 * 1024 * 1024, '文件最大10MB'),  // 10MB
});

// 允许的文件类型
const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'application/javascript',
  'text/x-python',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
];

// 响应
interface UploadUrlResponse {
  uploadUrl: string;    // 直传URL
  fileKey: string;      // 文件key（用于后续关联）
  expiresIn: number;    // 凭证过期时间（秒）
}

// Server Action
async function getUploadUrl(
  input: GetUploadUrlInput
): Promise<ApiResponse<UploadUrlResponse>>
```

### 6.2 确认上传完成

```typescript
// ==================== 确认上传完成 ====================

// 请求参数
interface ConfirmUploadInput {
  fileKey: string;
  filename: string;
  type: string;
  size: number;
}

// Zod 验证
const confirmUploadSchema = z.object({
  fileKey: z.string(),
  filename: z.string().max(255),
  type: z.string(),
  size: z.number().int(),
});

// 响应
interface ConfirmUploadResponse {
  id: string;       // 文件记录ID
  url: string;      // 文件访问URL
}

// Server Action
async function confirmUpload(
  input: ConfirmUploadInput
): Promise<ApiResponse<ConfirmUploadResponse>>
```

---

## 七、分类/标签 API

### 7.1 获取所有分类

```typescript
// ==================== 获取所有分类 ====================

// 无参数
// 响应
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  contentsCount: number;  // 该分类下的内容数量
}

async function getCategories(): Promise<ApiResponse<Category[]>>
```

### 7.2 获取热门标签

```typescript
// ==================== 获取热门标签 ====================

// 请求参数
interface GetPopularTagsInput {
  limit?: number;  // 默认 20
}

// Zod 验证
const getPopularTagsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// 响应
interface Tag {
  id: string;
  name: string;
  slug: string;
  contentsCount: number;
}

async function getPopularTags(
  input: GetPopularTagsInput
): Promise<ApiResponse<Tag[]>>
```

---

## 八、首页数据 API

### 8.1 获取首页数据

```typescript
// ==================== 获取首页数据（聚合接口） ====================

// 无参数
// 响应
interface HomeData {
  // 精选推荐
  featured: ContentListItem[];

  // 最新发布
  latest: ContentListItem[];

  // 热门内容
  popular: ContentListItem[];

  // 热门分类
  categories: Category[];

  // 统计
  stats: {
    totalContents: number;
    totalUsers: number;
    totalCategories: number;
  };
}

async function getHomeData(): Promise<ApiResponse<HomeData>>
```

---

## 九、API 汇总表

| 模块 | API | 权限 |
|------|-----|------|
| **认证** | register | 公开 |
| | login | 公开 |
| | logout | 登录 |
| | getCurrentUser | 登录 |
| **内容** | getContents | 公开 |
| | getContent | 公开 |
| | createContent | 登录 |
| | updateContent | 登录+作者 |
| | publishContent | 登录+作者 |
| | deleteContent | 登录+作者 |
| | getMyContents | 登录 |
| **互动** | getComments | 公开 |
| | createComment | 登录 |
| | deleteComment | 登录+作者 |
| | rateContent | 登录 |
| | toggleCollection | 登录 |
| | getMyCollections | 登录 |
| **搜索** | searchContents | 公开 |
| | getSearchSuggestions | 公开 |
| **文件** | getUploadUrl | 登录 |
| | confirmUpload | 登录 |
| **元数据** | getCategories | 公开 |
| | getPopularTags | 公开 |
| | getHomeData | 公开 |

---

**文档版本**：v1.0
**最后更新**：2026-03-10
