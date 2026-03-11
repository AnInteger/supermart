import Link from 'next/link';
import { ContentListItem } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';
import { Star, Eye, Clock, User } from 'lucide-react';

interface ContentCardProps {
  content: ContentListItem;
}

export function ContentCard({ content }: ContentCardProps) {
  const authorInitial = content.author.name?.charAt(0).toUpperCase() || 'U';

  return (
    <Link href={`/content/${content.id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden">
        <div className="p-5 flex flex-col h-full">
          {/* 标题区域 - 清晰的视觉层级 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={content.type === 'SKILL' ? 'default' : 'secondary'}
                className="text-xs font-medium"
              >
                {content.type}
              </Badge>
              {content.avgRating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{content.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
              {content.name}
            </h3>
          </div>

          {/* 描述区域 - 主要内容 */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow leading-relaxed">
            {content.description}
          </p>

          {/* 分隔线 */}
          <div className="border-t pt-4 mt-auto">
            {/* 元数据区域 - 模块化排列 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {/* 作者信息 */}
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={content.author.avatar || ''} />
                  <AvatarFallback className="text-[10px]">{authorInitial}</AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px]">{content.author.name}</span>
              </div>

              {/* 统计信息 */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{content.viewCount}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(content.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
