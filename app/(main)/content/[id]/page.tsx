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
