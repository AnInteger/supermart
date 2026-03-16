// 内容类型
export const CONTENT_TYPES = {
  SKILL: "SKILL",
} as const;

// 内容状态
export const CONTENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

// 用户角色
export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

// 分类（预设）
export const DEFAULT_CATEGORIES = [
  { name: "软件开发", slug: "software-dev", icon: "code" },
  { name: "建筑设计", slug: "architecture", icon: "building" },
  { name: "法律服务", slug: "legal", icon: "scale" },
  { name: "设计创意", slug: "design", icon: "palette" },
  { name: "社媒运营", slug: "social-media", icon: "share" },
];

// 排序选项
export const SORT_OPTIONS = [
  { value: "latest", label: "最新发布" },
  { value: "popular", label: "最受欢迎" },
  { value: "rating", label: "评分最高" },
] as const;

// 分页
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// 缓存键前缀
export const CACHE_KEYS = {
  CONTENT_LIST: "content:list",
  CONTENT_DETAIL: "content:detail",
  USER_PROFILE: "user:profile",
  CATEGORIES: "categories",
  HOME_DATA: "home:data",
};
