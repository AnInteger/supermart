'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ContentDetail as ContentType } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars, RatingDisplay } from '@/components/interaction/RatingStars';
import { CollectionButton } from '@/components/interaction/CollectionButton';
import { CommentSection } from '@/components/interaction/CommentSection';
import { formatRelativeTime } from '@/lib/utils';
import { Eye, Calendar, MessageSquare, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ContentDetailProps {
  content: ContentType;
}

export function ContentDetail({ content }: ContentDetailProps) {
  const authorInitial = content.author.name?.charAt(0).toUpperCase() || 'U';
  const [copied, setCopied] = useState(false);

  // 复制内容到剪贴板
  const copyContent = async () => {
    if (content.content) {
      await navigator.clipboard.writeText(content.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 顶部元信息栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
        <Badge variant={content.type === 'SKILL' ? 'default' : 'secondary'} className="text-xs">
          {content.type}
        </Badge>
        <span className="text-border">|</span>
        <Badge variant="outline" className="text-xs">{content.category.name}</Badge>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>{content.viewCount}</span>
        </div>
        <span className="text-border">|</span>
        <RatingDisplay
          avgRating={content.avgRating}
          ratingCount={content.ratingCount}
        />
        <span className="text-border">|</span>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatRelativeTime(content.createdAt)}</span>
        </div>
      </div>

      {/* 主标题区 */}
      <h1 className="text-2xl font-bold mb-4">{content.name}</h1>
      <p className="text-muted-foreground mb-6">{content.description}</p>

      {/* 作者和操作栏 */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={content.author.avatar || ''} />
            <AvatarFallback>{authorInitial}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{content.author.name}</p>
            <p className="text-xs text-muted-foreground">作者</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CollectionButton contentId={content.id} />
          {content.content && (
            <button
              onClick={copyContent}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-muted transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Markdown 内容区 */}
      {content.content && (
        <article className="prose prose-sm dark:prose-invert max-w-none mb-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.content}
          </ReactMarkdown>
        </article>
      )}

      {/* 标签 */}
      {content.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-8 pb-4 border-b">
          <span className="text-sm text-muted-foreground">标签:</span>
          <div className="flex flex-wrap gap-1.5">
            {content.tags.map((t) => (
              <Badge key={t.id} variant="outline" className="text-xs">
                {t.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 评分区 */}
      <Card className="mb-8 bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">觉得有用？给个评分吧</p>
            <RatingStars
              contentId={content.id}
              initialRating={(content as any).userRating?.score || 0}
              avgRating={content.avgRating}
              ratingCount={(content as any).ratingCount || 0}
              showCount
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* 编辑/删除按钮 */}
      {content.isOwner && (
        <div className="flex items-center gap-4 mb-8">
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
        </div>
      )}

      {/* 评论区 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">评论 ({(content as any)._count?.comments || 0})</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <CommentSection contentId={content.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
