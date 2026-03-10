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
import { Loader2 } from 'lucide-react';

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
          await publishContent({ id: result.data.id });
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
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存草稿'}
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(form.getValues(), true)}
            disabled={isPending}
          >
            {isPublishing ? (
              <>
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              isPending ? '发布中...' : '发布'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
