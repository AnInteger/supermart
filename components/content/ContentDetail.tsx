import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ContentDetail as ContentType } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars, RatingDisplay } from '@/components/interaction/RatingStars';
import { CollectionButton } from '@/components/interaction/CollectionButton';
import { CommentSection } from '@/components/interaction/CommentSection';
import { formatRelativeTime } from '@/lib/utils';
import { Eye, Download, Calendar, User } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface ContentDetailProps {
  content: ContentType;
}

export function ContentDetail({ content }: ContentDetailProps) {
  const authorInitial = content.author.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 主内容区 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 头部信息 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={content.type === 'SKILL' ? 'default' : 'secondary'}>
              {content.type}
            </Badge>
            <Badge variant="outline">{content.category.name}</Badge>
          </div>

          <h1 className="text-3xl font-bold">{content.name}</h1>
          <p className="text-lg text-muted-foreground">{content.description}</p>

        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{content.viewCount} 浏览</span>
          </div>
          <RatingDisplay
            avgRating={content.avgRating}
            ratingCount={content.ratingCount}
          />
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatRelativeTime(content.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 操作指令 */}
      {content.instruction && (
        <Card>
          <CardHeader>
            <CardTitle>操作指令</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.instruction}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分步设置指南 */}
      {content.setupGuide && (
        <Card>
          <CardHeader>
            <CardTitle>分步设置指南</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.setupGuide}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用案例 */}
      {content.examples && (
        <Card>
          <CardHeader>
            <CardTitle>使用案例</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.examples}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 评论/编辑按钮 */}
      <div className="flex items-center gap-4">
        {content.isOwner && (
          <>
            <Link
              href={`/edit/${content.id}`}
              className="text-sm text-primary hover:underline"
            >
              编辑
            </Link>
            <button
              className="text-sm text-destructive hover:underline"
              onClick={() => {
                if (confirm('确定要删除此内容吗？')) {
                  // 调用删除 action
                }
              }}
            >
              删除
            </button>
          </>
        )}
      </div>

      {/* 评论区 */}
      <Card>
        <CardHeader>
          <CardTitle>评论 ({content._count.comments})</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentSection contentId={content.id} />
        </CardContent>
      </Card>
    </div>

    {/* 侧边栏 */}
    <div className="space-y-6">
      {/* 作者信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">作者</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={content.author.avatar || ''} />
              <AvatarFallback>{authorInitial}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{content.author.name}</p>
              {content.author.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {content.author.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <CollectionButton contentId={content.id} />

        {/* 评分 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">评分</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingStars
              contentId={content.id}
              initialRating={content.userRating?.score || 0}
              avgRating={content.avgRating}
              ratingCount={content.ratingCount}
              showCount
              size="lg"
            />
          </CardContent>
        </Card>
      </div>

      {/* 标签 */}
      {content.tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((t) => (
                <Badge key={t.tag.id} variant="outline">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
