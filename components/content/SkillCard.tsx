import Link from 'next/link';
import { ContentListItem } from '@/types/api';
import { Download, Heart, Star, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SkillCardProps {
  skill: ContentListItem;
}

export function SkillCard({ skill }: SkillCardProps) {
  const authorInitial = skill.author.name?.charAt(0).toUpperCase() || 'U';

  return (
    <Link
      href={`/content/${skill.id}`}
      className="block bg-white rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all border border-slate-200/50 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-slate-800 group-hover:text-purple-600 transition-colors mb-2">
            {skill.name}
          </h3>
          <div className="flex items-center space-x-2 mb-3">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg">
              {skill.category.icon} {skill.category.name}
            </span>
            <span className="text-xs text-slate-500">{skill.version}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
        {skill.description}
      </p>

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-4 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{skill.viewCount.toLocaleString()}</span>
          </div>
          {skill.downloadCount !== undefined && (
            <div className="flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>{skill.downloadCount.toLocaleString()}</span>
            </div>
          )}
          {skill.favoriteCount !== undefined && (
            <div className="flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{skill.favoriteCount.toLocaleString()}</span>
            </div>
          )}
        </div>
        {skill.avgRating && (
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-700">
              {skill.avgRating.toFixed(1)}
            </span>
            {skill.ratingCount !== undefined && (
              <span className="text-xs text-slate-500">
                ({skill.ratingCount})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-100">
        <Avatar className="w-6 h-6">
          <AvatarImage src={skill.author.avatar || ''} alt={skill.author.name || ''} />
          <AvatarFallback className="text-[10px]">{authorInitial}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-slate-600">{skill.author.name}</span>
      </div>
    </Link>
  );
}
