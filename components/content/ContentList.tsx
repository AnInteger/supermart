'use client';

import { SkillCard } from './SkillCard';
import { ContentListItem, PaginationInfo } from '@/types/api';
import { Pagination } from '@/components/common/Pagination';
import { Search } from 'lucide-react';

interface ContentListProps {
  items: ContentListItem[];
  pagination?: PaginationInfo;
  emptyMessage?: string;
}

export function ContentList({ items, pagination, emptyMessage = '暂无内容' }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          未找到相关 Skill
        </h3>
        <p className="text-slate-500">
          试试其他搜索关键词或浏览不同分类
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((content) => (
          <SkillCard key={content.id} skill={content} />
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <Pagination pagination={pagination} />
      )}
    </div>
  );
}
