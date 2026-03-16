import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getContent } from '@/app/actions/content';
import { getCategories } from '@/app/actions/meta';
import { ContentForm } from '@/components/content/ContentForm';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { cn } from '@/lib/utils';

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [contentResult, categoriesResult] = await Promise.all([
    getContent(id),
    getCategories(),
  ]);

  if (!contentResult.success || !contentResult.data) {
    notFound();
  }

  // 检查权限
  if (!contentResult.data.isOwner) {
    redirect('/');
  }

  // 确保 categories 有数据
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={cn('max-w-4xl mx-auto')}>
        <h1 className="text-3xl font-bold mb-8">编辑内容</h1>
        <ContentForm
          mode="edit"
          contentId={id}
          categories={categories}
          defaultValues={{
            name: contentResult.data.name,
            description: contentResult.data.description,
            version: contentResult.data.version,
            versionNotes: contentResult.data.versionNotes || undefined,
            categoryId: contentResult.data.category.id,
            content: contentResult.data.content || '',
            license: contentResult.data.license,
          }}
        />
      </div>
    </div>
  );
}
