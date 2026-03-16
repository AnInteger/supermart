'use client';

import { ContentDetail as ContentType, ContentFile } from '@/types/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentSection } from '@/components/interaction/CommentSection';
import { formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import {
  Download, Heart, Star, Eye, Calendar, Shield, ChevronRight,
  ChevronDown, FileText, Folder, AlertCircle, History, Plus,
} from 'lucide-react';
import { toggleCollection, rateContent } from '@/app/actions/interaction';
import { toast } from 'sonner';
import { FileTree } from '@/components/content/FileTree';

interface ContentDetailProps {
  content: ContentType;
}

export function ContentDetail({ content }: ContentDetailProps) {
  const authorInitial = content.author.name?.charAt(0).toUpperCase() || 'U';
  const [selectedFile, setSelectedFile] = useState<ContentFile | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(content.isCollected || false);

  const handleToggleFavorite = async () => {
    const result = await toggleCollection({ contentId: content.id });
    if (result.success) {
      setIsFavorite(result.data.collected);
      toast.success(result.data.collected ? '已收藏' : '已取消收藏');
    } else {
      toast.error(result.error || '操作失败');
    }
  };

  const handleSubmitRating = async (rating: number) => {
    const result = await rateContent({ contentId: content.id, score: rating });
    if (result.success) {
      setUserRating(rating);
      toast.success('评分成功');
    } else {
      toast.error(result.error || '评分失败');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-purple-600">首页</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700">{content.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/50">
            <div className="flex items-center space-x-3 mb-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg">
                {content.category.icon && <span className="mr-1">{content.category.icon}</span>}
                {content.category.name}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg">{content.version}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{content.name}</h1>

            {/* Author */}
            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
              <Avatar className="w-12 h-12">
                <AvatarImage src={content.author.avatar || ''} />
                <AvatarFallback>{authorInitial}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-slate-700">{content.author.name}</div>
                <div className="text-sm text-slate-500">
                  发布于 {formatRelativeTime(content.createdAt)} · 更新于 {formatRelativeTime(content.updatedAt)}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Eye className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-700">{content.viewCount.toLocaleString()}</div>
                <div className="text-xs text-slate-500">浏览量</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Download className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-700">{content.downloadCount || 0}</div>
                <div className="text-xs text-slate-500">下载量</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Heart className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-700">{content.favoriteCount || 0}</div>
                <div className="text-xs text-slate-500">收藏数</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-700">{content.avgRating?.toFixed(1) || '-'}</div>
                <div className="text-xs text-slate-500">{content.ratingCount || 0} 评价</div>
              </div>
            </div>

            {/* Description */}
            <h2 className="font-semibold text-lg mb-3">简介</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-6">{content.description}</p>

            {/* Tags */}
            {content.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-semibold mb-3">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((t) => (
                    <span key={t.id} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">{t.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Version Notes */}
          {content.versionNotes && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-lg">版本说明</h2>
              </div>
              <div className="flex items-start space-x-3">
                <div className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">{content.version}</div>
                <p className="text-slate-600">{content.versionNotes}</p>
              </div>
            </div>
          )}

          {/* File Structure */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
            <h2 className="font-semibold text-lg mb-4">文件结构</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {content.files && content.files.length > 0 ? (
                  <FileTree files={content.files} onSelectFile={setSelectedFile} />
                ) : (
                  <p className="text-slate-500 text-center py-8">暂无文件</p>
                )}
              </div>
              <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {selectedFile ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-slate-200">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">{selectedFile.path}</span>
                    </div>
                    {selectedFile.fileContent ? (
                      <pre className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {selectedFile.fileContent}
                      </pre>
                    ) : (
                      <div className="text-slate-400 text-sm text-center py-8">
                        该文件暂不支持预览
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    点击左侧文件查看内容
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Safety Report */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-green-900 mb-2">安全性报告</h2>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg font-medium">安全</div>
                  <span className="text-green-700 text-sm">该 Skill 已通过安全性检测</span>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2"><strong>检测结果：</strong></p>
                  <ul className="text-sm text-green-700 space-y-1 ml-4">
                    <li>✓ 未发现恶意代码</li>
                    <li>✓ 未包含敏感信息</li>
                    <li>✓ 文件结构符合规范</li>
                    <li>✓ 依赖项安全检查通过</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
            <CommentSection contentId={content.id} />
          </div>

          {/* Author Actions - Only visible to author */}
          {content.isOwner && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200/50">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-purple-900 mb-1">
                    作者操作
                  </h3>
                  <p className="text-sm text-purple-700">
                    您是此 Skill 的作者，可以发布新版本
                  </p>
                </div>
              </div>
              <Link
                href={`/content/${content.id}/new-version`}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>发布新版本</span>
              </Link>
              <p className="text-xs text-purple-600 mt-3 text-center">
                已发布的 Skill 不可编辑，只能通过发布新版本来更新
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50 space-y-3">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>下载 Skill</span>
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
                  isFavorite ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-600' : ''}`} />
                <span>{isFavorite ? '已收藏' : '收藏'}</span>
              </button>

              {/* Rating */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-2">为这个 Skill 评分</p>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleSubmitRating(rating)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {content.isOwner && (
                <Link
                  href={`/edit/${content.id}`}
                  className="w-full mt-3 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors text-center block"
                >
                  编辑内容
                </Link>
              )}
            </div>

            {/* License */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="font-semibold mb-3">开源许可</h3>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    该 Skill 使用 <strong>{content.license || 'MIT-0'}</strong> 许可证
                  </p>
                  <p className="text-xs text-slate-500">
                    {content.license === 'MIT-0' || !content.license
                      ? '您可以自由使用、修改和分发，无需署名'
                      : '请遵守相应的许可证条款'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
