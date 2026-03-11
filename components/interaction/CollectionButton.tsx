'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleCollection } from '@/app/actions/interaction';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CollectionButtonProps {
  contentId: string;
  initialCollected?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CollectionButton({
  contentId,
  initialCollected = false,
  showText = true,
  size = 'md',
}: CollectionButtonProps) {
  const [collected, setCollected] = useState(initialCollected);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleCollection({ contentId });

      if (result.success) {
        setCollected(result.data.collected);
        toast.success(result.data.collected ? '已收藏' : '已取消收藏');
      } else {
        toast.error(result.error || '操作失败');
      }
    });
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSize = {
    sm: 'sm' as const,
    md: 'default' as const,
    lg: 'lg' as const,
  };

  return (
    <Button
      variant={collected ? 'default' : 'outline'}
      size={buttonSize[size]}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          collected && 'fill-current'
        )}
      />
      {showText && (
        <span className="ml-2">
          {collected ? '已收藏' : '收藏'}
        </span>
      )}
    </Button>
  );
}
