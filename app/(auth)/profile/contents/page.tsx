import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getMyContents } from '@/app/actions/content';
import { ContentList } from '@/components/content/ContentList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function MyContentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const contentsResult = await getMyContents({ page: 1, pageSize: 12 });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">我的内容</h1>
        <Link href="/create">
          <Button>创建新内容</Button>
        </Link>
      </div>

      {!contentsResult.success ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">加载失败，请刷新页面重试</p>
          </CardContent>
        </Card>
      ) : contentsResult.data.items.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">暂无内容</p>
            <Link href="/create">
              <Button>创建第一个内容</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ContentList items={contentsResult.data.items} />
      )}
    </div>
  );
}
