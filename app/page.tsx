import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getHomeData } from '@/app/actions/content';
import { ContentList } from '@/components/content/ContentList';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { ContentStatus } from '@prisma/client';

interface HomePageProps {
  searchParams: {
    category?: string;
    type?: 'SKILL' | 'AGENT';
    sort?: 'latest' | 'popular' | 'rating';
    page?: string;
    query?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // 检查用户是否登录
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const homeData = await getHomeData();

  if (!homeData.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">加载失败，请刷新页面重试</p>
      </div>
    );
  }

  const { stats, categories, featured, latest, popular } = homeData.data as any;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-12">
        <h1 className="text-4xl font-bold mb-4">SuperMart</h1>
        <p className="text-xl text-muted-foreground mb-8">
          国内垂类AI工具平台，让专业知识规模化复用
        </p>

        <div className="flex justify-center gap-8 text-center">
          <div>
            <p className="text-3xl font-bold">{stats.totalContents}</p>
            <p className="text-sm text-muted-foreground">Skill/Agent</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">用户</p>
          </div>
        </div>
      </section>

      {/* 分类导航 */}
      {categories && categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">探索分类</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/explore?category=${category.id}`}
                className="px-4 py-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.name}
                <span className="ml-2 text-muted-foreground text-sm">
                  ({category._count?.contents || 0})
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 最新发布 */}
      {latest && latest.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">最新发布</h2>
            <Link href="/explore?sort=latest" className="text-sm text-primary hover:underline">
              查看更多 →
            </Link>
          </div>
          <ContentList items={latest} />
        </section>
      )}

      {/* 热门内容 */}
      {popular && popular.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">热门内容</h2>
            <Link href="/explore?sort=popular" className="text-sm text-primary hover:underline">
              查看更多 →
            </Link>
          </div>
          <ContentList items={popular} />
        </section>
      )}
    </div>
  );
}
