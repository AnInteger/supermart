'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createComment } from '@/app/actions/interaction';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const commentSchema = z.object({
  body: z.string().min(1, '请输入评论内容').max(1000, '评论最多1000个字符'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  contentId: string;
  onSuccess?: () => void;
}

export function CommentForm({ contentId, onSuccess }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const onSubmit = (data: CommentFormValues) => {
    startTransition(async () => {
      const result = await createComment({
        contentId,
        body: data.body,
      });

      if (result.success) {
        form.reset();
        toast.success('评论成功');
        onSuccess?.();
      } else {
        toast.error(result.error || '评论失败');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="写下你的评论..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? '提交中...' : '发表评论'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
