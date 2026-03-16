'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/validators';
import { register as registerAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type RegisterFormValues = {
  email: string;
  password: string;
  name: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      const result = await registerAction(data);

      if (!result.success) {
        if (result.details) {
          Object.entries(result.details).forEach(([field, messages]) => {
            form.setError(field as keyof RegisterFormValues, {
              message: messages[0],
            });
          });
        } else {
          toast.error('注册失败', {
            description: result.error,
          });
        }
      } else {
        toast.success('注册成功');
        router.push('/');
        router.refresh();
      }
    } catch {
      toast.error('注册失败', {
        description: '请稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">创建账号</h1>
            <p className="text-slate-500 text-sm">加入我们，分享你的专业技能</p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">昵称</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入昵称"
                    className="border-slate-300 focus:border-purple-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">邮箱</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="请输入邮箱"
                    className="border-slate-300 focus:border-purple-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">密码</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="至少8位，包含大小写字母和数字"
                    className="border-slate-300 focus:border-purple-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                注册中...
              </>
            ) : (
              '注册'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
