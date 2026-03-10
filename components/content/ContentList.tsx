'use client';
import { ContentCard } from './ContentCard';
import { ContentListItem, PaginationInfo } from '@/types/api';
import { Pagination } from '@/components/common/Pagination';
interface ContentListProps {
  items: ContentListItem[];
  pagination?: PaginationInfo;
  emptyMessage?: string;
}
export function ContentList({ items, pagination, emptyMessage = '暂无内容' }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <Pagination pagination={pagination} />
      )}
    </div>
  );
}
