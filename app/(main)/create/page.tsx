import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getCategories } from '@/app/actions/meta';
import { ContentForm } from '@/components/content/ContentForm';

import { Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { cn } from '@/lib/utils';

export default async function CreatePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/create');
  }

  const categoriesResult = await getCategories();

  if (!categoriesResult.success) {
    return (
      <div className={container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">加载失败，请刷新页面重试</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={container mx-auto px-4 py-8">
      <div className={cn('max-w-4xl mx-auto')}>
        <h1 className={text-3xl font-bold mb-8">创建 Skill / Agent</h1>
        <ContentForm
          mode="create"
          categories={categoriesResult.data}
        />
      </div>
    </div>
  );
}
