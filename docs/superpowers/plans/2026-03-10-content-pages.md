# 内容详情页和创建页面实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建内容详情页和内容创建/编辑页面，整合所有功能组件

**Architecture:** 动态路由 + Server Actions，Markdown 渲染，文件上传

**Tech Stack:** react-markdown, react-dropzone, @uiw/react-md-editor

---

## File Structure

```
app/
├── (main)/
│   ├── content/
│   │   └── [id]/
│   │       └── page.tsx           # 内容详情页
│   ├── create/
│   │   └── page.tsx               # 创建内容页
│   └── edit/
│       └── [id]/
│           └── page.tsx           # 编辑内容页
components/
├── content/
│   ├── ContentDetail.tsx          # 内容详情展示
│   └── ContentForm.tsx            # 创建/编辑表单
```

---

## Task 1: 创建内容详情页

**Files:**
- Create: `components/content/ContentDetail.tsx`
- Create: `app/(main)/content/[id]/page.tsx`

- [ ] **Step 1: 安装 Markdown 渲染库**

```bash
npm install react-markdown remark-gfm
```

- [ ] **Step 2: 创建内容详情展示组件**

Create: `components/content/ContentDetail.tsx`

```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ContentDetail as ContentType } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars, RatingDisplay } from '@/components/interaction/RatingStars';
import { CollectionButton } from '@/components/interaction/CollectionButton';
import { CommentSection } from '@/components/interaction/CommentSection';
import { formatRelativeTime } from '@/lib/utils';
import { Eye, Download, Calendar, User } from 'lucide-react';

interface ContentDetailProps {
  content: ContentType;
}

export function ContentDetail({ content }: ContentDetailProps) {
  const authorInitial = content.author.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 主内容区 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 头部信息 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={content.type === 'SKILL' ? 'default' : 'secondary'}>
              {content.type}
            </Badge>
            <Badge variant="outline">{content.category.name}</Badge>
          </div>

          <h1 className="text-3xl font-bold">{content.name}</h1>

          <p className="text-lg text-muted-foreground">{content.description}</p>

          {/* 统计信息 */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{content.viewCount} 浏览</span>
            </div>
            <RatingDisplay
              avgRating={content.avgRating}
              ratingCount={content.ratingCount}
            />
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeTime(content.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 操作指令 */}
        {content.instruction && (
          <Card>
            <CardHeader>
              <CardTitle>操作指令</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content.instruction}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分步设置指南 */}
        {content.setupGuide && (
          <Card>
            <CardHeader>
              <CardTitle>分步设置指南</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content.setupGuide}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用案例 */}
        {content.examples && (
          <Card>
            <CardHeader>
              <CardTitle>使用案例</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content.examples}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 评论/编辑按钮 */}
        <div className="flex items-center gap-4">
          {content.isOwner && (
            <>
              <a
                href={`/edit/${content.id}`}
                className="text-sm text-primary hover:underline"
              >
                编辑
              </a>
              <button
                className="text-sm text-destructive hover:underline"
                onClick={() => {
                  if (confirm('确定要删除此内容吗？')) {
                    // 调用删除 action
                  }
                }}
              >
                删除
              </button>
            </>
          )}
        </div>

        {/* 评论区 */}
        <Card>
          <CardHeader>
            <CardTitle>评论 ({content._count.comments})</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentSection contentId={content.id} />
          </CardContent>
        </Card>
      </div>

      {/* 侧边栏 */}
      <div className="space-y-6">
        {/* 作者信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">作者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={content.author.avatar || ''} />
                <AvatarFallback>{authorInitial}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{content.author.name}</p>
                {content.author.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {content.author.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <CollectionButton contentId={content.id} />

          {/* 评分 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">评分</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingStars
                contentId={content.id}
                initialRating={content.userRating?.score || 0}
                avgRating={content.avgRating}
                ratingCount={content.ratingCount}
                showCount
                size="lg"
              />
            </CardContent>
          </Card>
        </div>

        {/* 标签 */}
        {content.tags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((t) => (
                  <Badge key={t.tag.id} variant="outline">
                    {t.tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 附件文件 */}
        {content.files.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">附件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {content.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建详情页路由**

Create: `app/(main)/content/[id]/page.tsx`

```tsx
import { notFound } from 'next/navigation';
import { getContentById } from '@/app/actions/content';
import { ContentDetail } from '@/components/content/ContentDetail';

interface ContentPageProps {
  params: {
    id: string;
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const result = await getContentById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentDetail content={result.data} />
    </div>
  );
}

// 生成元数据
export async function generateMetadata({ params }: ContentPageProps) {
  const result = await getContentById(params.id);

  if (!result.success || !result.data) {
    return { title: '内容不存在' };
  }

  return {
    title: result.data.name,
    description: result.data.description,
  };
}
```

- [ ] **Step 4: 提交详情页**

```bash
git add components/content/ContentDetail.tsx app/\(main\)/content/
git commit -m "feat: add content detail page with markdown rendering"
```

---

## Task 2: 创建内容创建/编辑表单

**Files:**
- Create: `components/content/ContentForm.tsx`

- [ ] **Step 1: 安装 Markdown 编辑器**

```bash
npm install @uiw/react-md-editor
```

- [ ] **Step 2: 创建内容表单组件**

Create: `components/content/ContentForm.tsx`

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContent, updateContent, publishContent } from '@/app/actions/content';
import { createContentSchema } from '@/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';

// 动态导入 Markdown 编辑器（避免 SSR 问题）
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

type ContentFormValues = z.infer<typeof createContentSchema>;

interface ContentFormProps {
  mode: 'create' | 'edit';
  contentId?: string;
  defaultValues?: Partial<ContentFormValues>;
  categories: Array<{ id: string; name: string }>;
}

export function ContentForm({
  mode,
  contentId,
  defaultValues,
  categories,
}: ContentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPublishing, setIsPublishing] = useState(false);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      type: 'SKILL',
      name: '',
      description: '',
      categoryId: '',
      instruction: '',
      setupGuide: '',
      examples: '',
      tagIds: [],
      fileIds: [],
      isDraft: true,
      ...defaultValues,
    },
  });

  const handleSubmit = (data: ContentFormValues, publish: boolean = false) => {
    startTransition(async () => {
      let result;

      if (mode === 'create') {
        result = await createContent({ ...data, isDraft: !publish });

        if (result.success && publish && result.data) {
          await publishContent(result.data.id);
        }
      } else if (contentId) {
        result = await updateContent(contentId, data);

        if (result.success && publish) {
          await publishContent(contentId);
        }
      }

      if (result?.success) {
        toast.success(publish ? '发布成功' : '保存成功');
        router.push(`/content/${result.data.id}`);
      } else {
        toast.error(result?.error || '操作失败');
      }
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SKILL">Skill</SelectItem>
                        <SelectItem value="AGENT">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="给你的 Skill/Agent 起个名字" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="简要描述这个 Skill/Agent 的功能和使用场景"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 操作指令 */}
        <Card>
          <CardHeader>
            <CardTitle>操作指令</CardTitle>
            <FormDescription>
              告诉 AI 如何执行特定任务，支持 Markdown 格式
            </FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value}
                        onChange={field.onChange}
                        height={300}
                        preview="edit"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 分步设置指南 */}
        <Card>
          <CardHeader>
            <CardTitle>分步设置指南</CardTitle>
            <FormDescription>
              详细的使用步骤，让用户能够正确配置和使用
            </FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="setupGuide"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value}
                        onChange={field.onChange}
                        height={300}
                        preview="edit"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 使用案例 */}
        <Card>
          <CardHeader>
            <CardTitle>使用案例</CardTitle>
            <FormDescription>
              展示实际使用场景和效果，帮助用户理解
            </FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="examples"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value}
                        onChange={field.onChange}
                        height={200}
                        preview="edit"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(form.getValues(), false)}
            disabled={isPending}
          >
            保存草稿
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(form.getValues(), true)}
            disabled={isPending}
          >
            {isPublishing ? '发布中...' : '发布'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 3: 提交表单组件**

```bash
git add components/content/ContentForm.tsx
git commit -m "feat: add content form with markdown editor"
```

---

## Task 3: 创建创建页面

**Files:**
- Create: `app/(main)/create/page.tsx`

- [ ] **Step 1: 创建内容创建页面**

Create: `app/(main)/create/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getCategories } from '@/app/actions/meta';
import { ContentForm } from '@/components/content/ContentForm';

export default async function CreatePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/create');
  }

  const categoriesResult = await getCategories();

  if (!categoriesResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">
          加载失败，请刷新页面重试
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">创建 Skill / Agent</h1>
        <ContentForm
          mode="create"
          categories={categoriesResult.data}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交创建页面**

```bash
git add app/\(main\)/create/page.tsx
git commit -m "feat: add content creation page"
```

---

## Task 4: 创建编辑页面

**Files:**
- Create: `app/(main)/edit/[id]/page.tsx`

- [ ] **Step 1: 创建编辑页面**

Create: `app/(main)/edit/[id]/page.tsx`

```tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getContentById } from '@/app/actions/content';
import { getCategories } from '@/app/actions/meta';
import { ContentForm } from '@/components/content/ContentForm';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [contentResult, categoriesResult] = await Promise.all([
    getContentById(params.id),
    getCategories(),
  ]);

  if (!contentResult.success || !contentResult.data) {
    notFound();
  }

  // 检查权限
  if (!contentResult.data.isOwner) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">编辑内容</h1>
        <ContentForm
          mode="edit"
          contentId={params.id}
          categories={categoriesResult.data || []}
          defaultValues={{
            type: contentResult.data.type,
            name: contentResult.data.name,
            description: contentResult.data.description,
            categoryId: contentResult.data.category.id,
            instruction: contentResult.data.instruction || '',
            setupGuide: contentResult.data.setupGuide || '',
            examples: contentResult.data.examples || '',
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交编辑页面**

```bash
git add app/\(main\)/edit/
git commit -m "feat: add content edit page"
```

---

## Summary

完成本计划后，你将拥有：

✅ 内容详情页（Markdown 渲染、评论、评分、收藏）
✅ 内容创建页面（Markdown 编辑器、表单验证）
✅ 内容编辑页面（权限检查、数据回填）

---

## 完整 MVP 功能检查清单

| 功能模块 | 状态 |
|----------|------|
| **用户管理** | |
| 邮箱注册 | ✅ |
| 密码登录 | ✅ |
| 个人资料管理 | ✅ |
| **浏览搜索** | |
| 分类浏览 | ✅ |
| 关键词搜索 | ✅ |
| 筛选排序 | ✅ |
| **内容详情** | |
| 基本信息展示 | ✅ |
| 操作指令（Markdown） | ✅ |
| 设置指南 | ✅ |
| 使用案例 | ✅ |
| **评论评分** | |
| 五星评分 | ✅ |
| 文字评论 | ✅ |
| **内容创建** | |
| 文本编辑（Markdown） | ✅ |
| 分类选择 | ✅ |
| 发布/草稿 | ✅ |
| 编辑/删除 | ✅ |

**MVP 完成！** 🎉
