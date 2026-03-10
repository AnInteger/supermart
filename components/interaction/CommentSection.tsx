'use client';

import { useEffect, useState } from 'react';
import { getComments, deleteComment } from '@/app/actions/interaction';
import { Comment } from '@/types/api';
import { CommentForm } from './CommentForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface CommentSectionProps {
  contentId: string;
  initialComments?: Comment[];
}

export function CommentSection({ contentId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = async (pageNum: number) => {
    setIsLoading(true);
    const result = await getComments({ contentId, page: pageNum, pageSize: 10 });
    setIsLoading(false);

    if (result.success) {
      if (pageNum === 1) {
        setComments(result.data.items);
      } else {
        setComments((prev) => [...prev, ...result.data.items]);
      }
      setHasMore(result.data.pagination.hasMore);
    }
  };

  useEffect(() => {
    loadComments(1);
  }, [contentId]);

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    const result = await deleteComment({ id: commentId });

    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('删除成功');
    } else {
      toast.error(result.error || '删除失败');
    }
  };

  const handleCommentSuccess = () => {
    loadComments(1);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage);
  };

  return (
    <div className="space-y-6">
      {/* 评论表单 */}
      <CommentForm contentId={contentId} onSuccess={handleCommentSuccess} />

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">
            暂无评论，来写下第一条吧！
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.author.avatar || ''} />
              <AvatarFallback>
                {comment.author.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                {comment.isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? '加载中...' : '加载更多'}
          </Button>
        </div>
      )}
    </div>
  );
}
