'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { rateContent } from '@/app/actions/interaction';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RatingStarsProps {
  contentId: string;
  initialRating?: number;
  avgRating?: number | null;
  ratingCount?: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function RatingStars({
  contentId,
  initialRating = 0,
  avgRating,
  ratingCount = 0,
  readonly = false,
  size = 'md',
  showCount = false,
}: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleRate = (score: number) => {
    if (readonly || isPending) return;

    startTransition(async () => {
      const result = await rateContent({ contentId, score });

      if (result.success) {
        setRating(score);
        toast.success('评分成功');
      } else {
        toast.error(result.error || '评分失败');
      }
    });
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly || isPending}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => handleRate(star)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300'
              )}
            />
          </button>
        ))}
      </div>

      {showCount && (
        <span className="text-sm text-muted-foreground ml-2">
          {avgRating ? avgRating.toFixed(1) : '0.0'}
          {ratingCount && ratingCount > 0 && `(${ratingCount})`}
        </span>
      )}
    </div>
  );
}

// 只读版本，用于列表展示
export function RatingDisplay({
  avgRating,
  ratingCount,
  size = 'sm',
}: {
  avgRating?: number | null;
  ratingCount?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const displayRating = avgRating || 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= Math.round(displayRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            )}
          />
        ))}
      </div>
      {ratingCount !== undefined && ratingCount > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          {displayRating.toFixed(1)} ({ratingCount})
        </span>
      )}
    </div>
  );
}
