import { getContents, getHomeData } from '@/app/actions/content';
import { getCategories } from '@/app/actions/meta';
import { ContentList } from '@/components/content/ContentList';
import { Pagination } from '@/components/common/Pagination';
import { Sparkles, TrendingUp, Users, Zap, Search } from 'lucide-react';
import Link from 'next/link';

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    sort?: 'latest' | 'popular' | 'rating';
    page?: string;
    query?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');

  // Fetch all data in parallel
  const [homeData, contentsResult, categoriesResult] = await Promise.all([
    getHomeData(),
    getContents({
      categoryId: params.category,
      sort: params.sort || 'latest',
      page,
      pageSize: 12,
      query: params.query,
    }),
    getCategories(),
  ]);

  if (!homeData.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">加载失败，请刷新页面重试</p>
      </div>
    );
  }

  const { stats, latest, popular } = homeData.data as any;
  const isSearching = params.query || params.category || params.page;

  // If user is searching/filtering, show the search results view
  if (isSearching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        {/* Hero Section - Compact when searching */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-sm">让专业知识规模化复用</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                发现
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  {' '}Skill 工作流
                </span>
              </h1>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
                <form action="/" method="get" className="flex items-center">
                  <Search className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="text"
                    name="query"
                    placeholder="搜索 Skill 名称或描述..."
                    defaultValue={params.query || ''}
                    className="flex-1 px-4 py-3 outline-none text-slate-700"
                  />
                  {params.category && (
                    <input type="hidden" name="category" value={params.category} />
                  )}
                  {params.sort && (
                    <input type="hidden" name="sort" value={params.sort} />
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    搜索
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories Filter */}
          {categoriesResult.success && categoriesResult.data.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Link
                href={`/${params.sort ? `?sort=${params.sort}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !params.category
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                全部
              </Link>
              {categoriesResult.data.map((category) => (
                <Link
                  key={category.id}
                  href={`/?${new URLSearchParams({
                    ...(params.sort ? { sort: params.sort } : {}),
                    ...(params.query ? { query: params.query } : {}),
                    category: category.id,
                  }).toString()}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    params.category === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Sort Options */}
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-sm text-slate-600">排序：</span>
            <Link
              href={`/?${new URLSearchParams({
                ...(params.category ? { category: params.category } : {}),
                ...(params.query ? { query: params.query } : {}),
                sort: 'latest',
              }).toString()}`}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                (params.sort === 'latest' || !params.sort)
                  ? 'bg-white border border-purple-500 text-purple-600'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              最新
            </Link>
            <Link
              href={`/?${new URLSearchParams({
                ...(params.category ? { category: params.category } : {}),
                ...(params.query ? { query: params.query } : {}),
                sort: 'popular',
              }).toString()}`}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                params.sort === 'popular'
                  ? 'bg-white border border-purple-500 text-purple-600'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              热门
            </Link>
            <Link
              href={`/?${new URLSearchParams({
                ...(params.category ? { category: params.category } : {}),
                ...(params.query ? { query: params.query } : {}),
                sort: 'rating',
              }).toString()}`}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                params.sort === 'rating'
                  ? 'bg-white border border-purple-500 text-purple-600'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              评分
            </Link>
          </div>

          {/* Results */}
          {!contentsResult.success ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">加载失败，请刷新页面重试</p>
            </div>
          ) : (
            <>
              <ContentList items={contentsResult.data.items} />

              {/* Pagination */}
              {contentsResult.data.pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination pagination={contentsResult.data.pagination} />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    );
  }

  // Default view: Hero + Features + Latest + Popular
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-blue-700/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm">让专业知识规模化复用</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              发现与分享专业
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Skill 工作流
              </span>
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              连接各领域专家，将实战经验转化为可复用的 Skill，让行业知识惠及更多人
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
              <form action="/" method="get" className="flex items-center">
                <Search className="w-5 h-5 text-slate-400 ml-4" />
                <input
                  type="text"
                  name="query"
                  placeholder="搜索 Skill 名称或描述..."
                  className="flex-1 px-4 py-3 outline-none text-slate-700"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  搜索
                </button>
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.totalContents}+</div>
                <div className="text-purple-200 text-sm">Skill 总数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}+</div>
                <div className="text-purple-200 text-sm">活跃用户</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-purple-200 text-sm">总下载量</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI 辅助生成</h3>
            <p className="text-slate-600 text-sm">
              上传 Skill 后自动生成专业简介和安全性报告，节省时间提升质量
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">活跃社区</h3>
            <p className="text-slate-600 text-sm">
              与各领域专家交流互动，通过评论和评分建立专业网络
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">版本管理</h3>
            <p className="text-slate-600 text-sm">
              完整的版本控制系统，持续改进 Skill 并让用户获取最新版本
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categoriesResult.success && categoriesResult.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <h2 className="text-2xl font-bold mb-6">探索分类</h2>
          <div className="flex flex-wrap gap-3">
            {categoriesResult.data.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                className="px-4 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 border border-slate-200 transition-all"
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Skills Section */}
      {latest && latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">最新发布</h2>
            <Link
              href="/?sort=latest"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              查看更多 →
            </Link>
          </div>
          <ContentList items={latest} />
        </section>
      )}

      {/* Popular Skills Section */}
      {popular && popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">热门内容</h2>
            <Link
              href="/?sort=popular"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              查看更多 →
            </Link>
          </div>
          <ContentList items={popular} />
        </section>
      )}
    </div>
  );
}
