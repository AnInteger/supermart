import { getHomeData } from '@/app/actions/content';
import { ContentService } from '@/services/content.service';
import { ContentList } from '@/components/content/ContentList';
import { categoryFilter } from '@/components/content/CategoryFilter';
import { searchBar } from '@/components/common/searchbar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { ContentStatus, from '@prisma/client';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentList } from '@/components/content/ContentList'
import { CategoryFilter } from '@/components/content/CategoryFilter'
import { SearchBar } from '@/components/common/SearchBar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react';
import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ContentListItem } from '@/types/api'
import { Pagination } from '@/components/common/Pagination'
import { ContentCard } from './ContentCard'
import { useDebounce } from '@/lib/utils'

interface CategoryFilterProps {
  categories: Category[];
  selectedId?: string;
}

export function CategoryFilter({ categories, selectedId }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleSelect = (categoryId: string | undefined) => {
      const params = new URLSearchParams(searchParams)
      if (categoryId) {
        params.set('category', categoryId)
      } else {
        params.delete('category')
      }
      params.delete('page') // 重置分页
      router.push(`${pathname}?${params.toString()}`)
    }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!selectedId ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSelect(undefined)}
      >
        全部分
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedId === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSelect(category.id)}
        >
      ))}
    </div>
  )
}
