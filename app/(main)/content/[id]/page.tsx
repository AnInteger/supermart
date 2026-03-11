import { notFound } from 'next/navigation';
import { getContent } from '@/app/actions/content';
import { ContentDetail as ContentDetailComponent } from '@/components/content/ContentDetail';

interface ContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { id } = await params;
  const result = await getContent(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentDetailComponent content={result.data} />
    </div>
  );
}

// 生成元数据
export async function generateMetadata({ params }: ContentPageProps) {
  const { id } = await params;
  const result = await getContent(id);

  if (!result.success || !result.data) {
    return { title: '内容不存在' };
  }

  return {
    title: result.data.name,
    description: result.data.description,
  };
}
