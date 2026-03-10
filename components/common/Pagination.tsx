'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PaginationInfo } from '@/types/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface PaginationProps {
  pagination: PaginationInfo;
}
export function Pagination({ pagination }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, totalPages, hasMore } = pagination;
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        上一页
      </Button>
      <span className="text-sm text-muted-foreground px-4">
        第 {page} / {totalPages} 页
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasMore}
        onClick={() => goToPage(page + 1)}
      >
        下一页
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
