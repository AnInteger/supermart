import { getContents } from '@/app/actions/content';
import { ContentList } from '@/components/content/ContentList';
import { CategoryFilter } from '@/components/content/CategoryFilter';
import { SearchBar } from '@/components/common/SearchBar';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';

interface ExplorePageProps {
  searchParams: {
    category?: string;
    type?: 'SKILL' | 'AGENT';
    sort?: 'latest' | 'popular' | 'rating';
    page?: string;
    query?: string;
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const [contentsResult, categoriesResult] = await Promise.all([
    getContents({
      categoryId: searchParams.category,
      type: searchParams.type,
      sort: searchParams.sort,
      page: parseInt(searchParams.page || '1'),
      pageSize: 12,
      query: searchParams.query,
    }),
    getCategories(),
  ])

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
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">探索分类</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/explore?category=${category.slug}`}
                className="text-sm py-2 px-4 hover:bg-primary hover:underline"
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                <span className="ml-2 text-muted-foreground">
                  ({category.contentsCount})
                </span>
              </Link>
            ))}
          </div>
        ))}
      )}

      {/* 最新发布 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">最新发布</h2>
          <Link href="/explore?sort=latest" className="text-sm text-primary hover:underline">
            查看更多 →
          </Link>
        ))}
      )}

      {/* 热门内容 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">热门内容</h2>
          <Link href="/explore?sort=popular" className="text-sm text-primary hover:underline">
            查看更多 →
          </Link>
        )}
      )}
    </div>
  );
}
