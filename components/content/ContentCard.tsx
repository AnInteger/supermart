import Link from 'next/link';
import { ContentListItem } from '@/types/api';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';
import { Star, Eye } from 'lucide-react';

interface ContentCardProps {
  content: ContentListItem;
}

export function ContentCard({ content }: ContentCardProps) {
  const authorInitial = content.author.name?.charAt(0).toUpperCase() || 'U';

  return (
    <Link href={`/content/${content.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge variant={content.type === 'SKILL' ? 'default' : 'secondary'}>
              {content.type}
            </Badge>
            {content.avgRating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{content.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {content.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {content.description}
          </p>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={content.author.avatar || ''} />
                <AvatarFallback className="text-xs">{authorInitial}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {content.author.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {content.viewCount}
              </span>
              <span>{formatRelativeTime(content.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
