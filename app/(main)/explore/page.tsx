import Link from 'next/link';
import { getContents, getHomeData } from '@/app/actions/content';
import { getCategories } from '@/app/actions/meta';
import { ContentList } from '@/components/content/ContentList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/common/Pagination';
import { Loader2 } from 'lucide-react';

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    type?: 'SKILL' | 'AGENT';
    sort?: 'latest' | 'popular' | 'rating';
    page?: string;
    query?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');

  const [contentsResult, categoriesResult] = await Promise.all([
    getContents({
      categoryId: params.category,
      type: params.type,
      sort: params.sort || 'latest',
      page,
      pageSize: 12,
      query: params.query,
    }),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">探索</h1>
        <p className="text-muted-foreground">
          发现并使用各类 Skill 和 Agent
        </p>
      </div>

      {/* 筛选区域 */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* 类型筛选 */}
        <div className="flex gap-2">
          <Link href="/explore">
            <Button variant={!params.type ? 'default' : 'outline'}>
              全部
            </Button>
          </Link>
          <Link href="/explore?type=SKILL">
            <Button variant={params.type === 'SKILL' ? 'default' : 'outline'}>
              Skill
            </Button>
          </Link>
          <Link href="/explore?type=AGENT">
            <Button variant={params.type === 'AGENT' ? 'default' : 'outline'}>
              Agent
            </Button>
          </Link>
        </div>

        {/* 排序 */}
        <div className="flex gap-2 ml-auto">
          <Link href={`/explore?${new URLSearchParams({ ...params, sort: 'latest' }).toString()}`}>
            <Button variant={params.sort === 'latest' || !params.sort ? 'default' : 'outline'}>
              最新
            </Button>
          </Link>
          <Link href={`/explore?${new URLSearchParams({ ...params, sort: 'popular' }).toString()}`}>
            <Button variant={params.sort === 'popular' ? 'default' : 'outline'}>
              热门
            </Button>
          </Link>
          <Link href={`/explore?${new URLSearchParams({ ...params, sort: 'rating' }).toString()}`}>
            <Button variant={params.sort === 'rating' ? 'default' : 'outline'}>
              评分
            </Button>
          </Link>
        </div>
      </div>

      {/* 分类筛选 */}
      {categoriesResult.success && categoriesResult.data.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/explore">
            <Button variant={!params.category ? 'default' : 'ghost'} size="sm">
              全部分类
            </Button>
          </Link>
          {categoriesResult.data.map((category) => (
            <Link
              key={category.id}
              href={`/explore?category=${category.id}`}
            >
              <Button
                variant={params.category === category.id ? 'default' : 'ghost'}
                size="sm"
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* 内容列表 */}
      {!contentsResult.success ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">加载失败，请刷新页面重试</p>
          </CardContent>
        </Card>
      ) : contentsResult.data.items.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">暂无内容</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ContentList items={contentsResult.data.items} />

          {/* 分页 */}
          {contentsResult.data.pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination pagination={contentsResult.data.pagination} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
