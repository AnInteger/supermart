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
import { Loader2, FileText } from 'lucide-react';

// 动态导入 Markdown 编辑器（避免 SSR 问题）
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

type ContentFormValues = z.infer<typeof createContentSchema>;

// 默认模板
const DEFAULT_TEMPLATE = `# {{name}}

简要描述这个 Skill/Agent 的功能和使用场景...

## When to Use This Skill

描述什么场景下应该使用这个 Skill...

## How to Use

### Step 1: 安装/配置

\`\`\`bash
# 安装命令或配置步骤
\`\`\`

### Step 2: 基本用法

详细的使用步骤...

### Step 3: 高级用法

进阶使用技巧...

## Examples

### Example 1: 基础示例

\`\`\`
示例代码或命令
\`\`\`

### Example 2: 高级示例

\`\`\`
更复杂的示例
\`\`\`

## Tips

- 提示1
- 提示2
- 提示3

## Common Issues

### 问题1
解决方案...

### 问题2
解决方案...
`;

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

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(createContentSchema) as any,
    defaultValues: {
      type: 'SKILL',
      name: '',
      description: '',
      categoryId: '',
      content: mode === 'create' ? DEFAULT_TEMPLATE : '',
      tagIds: [],
      fileIds: [],
      isDraft: true,
      ...defaultValues,
    },
  });

  // 插入模板
  const insertTemplate = () => {
    const name = form.getValues('name') || '{{name}}';
    const template = DEFAULT_TEMPLATE.replace('{{name}}', name);
    form.setValue('content', template);
    toast.success('已插入模板');
  };

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
        // 显示详细验证错误
        const errorMsg = result?.error || '操作失败';
        const details = result?.details as Record<string, string[]> | undefined;
        if (details) {
          const detailMsg = Object.entries(details)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('; ');
          toast.error(`${errorMsg} - ${detailMsg}`);
        } else {
          toast.error(errorMsg);
        }
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      key={categories.length > 0 ? 'loaded' : 'loading'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择分类">
                            {field.value
                              ? categories.find(c => c.id === field.value)?.name
                              : null}
                          </SelectValue>
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

        {/* 内容编辑器 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>内容</CardTitle>
                <FormDescription className="mt-1.5">
                  编写完整的 Skill/Agent 文档，支持 Markdown 格式。建议包含：使用场景、安装步骤、示例代码、常见问题等
                </FormDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={insertTemplate}
                className="shrink-0"
              >
                <FileText className="h-4 w-4 mr-1" />
                使用模板
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value}
                        onChange={field.onChange}
                        height={500}
                        preview="live"
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
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存草稿'}
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(form.getValues(), true)}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                发布中...
              </>
            ) : (
              '发布'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
