import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getContentById } from '@/app/actions/content';
import { getCategories } from '@/app/actions/meta';
import { ContentForm } from '@/components/content/ContentForm';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { cn } from '@/lib/utils';

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
    <div className={container mx-auto px-4 py-8}>
      <div className={cn('max-w-4xl mx-auto')}>
        <h1 className={text-3xl font-bold mb-8">编辑内容</h1>
        <ContentForm
          mode="edit"
          contentId={params.id}
          categories={categoriesResult.data}
          defaultValues={{
            type: contentResult.data.type,
            name: contentResult.data.name,
            description: contentResult.data.description,
            categoryId: contentResult.data.category.id,
            instruction: contentResult.data.instruction || '',
            setupGuide: contentResult.data.setupGuide || '',
            examples: contentResult.data.examples || '',
          }
        }
      />
    </div>
  );
}
