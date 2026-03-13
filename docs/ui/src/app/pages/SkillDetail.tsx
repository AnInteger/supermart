import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Download,
  Heart,
  Star,
  Eye,
  Calendar,
  Shield,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { mockSkills, mockComments, FileNode } from '../data/mockData';

export function SkillDetail() {
  const { id } = useParams();
  const skill = mockSkills.find((s) => s.id === id);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root'])
  );
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comment, setComment] = useState('');

  if (!skill) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-700">Skill 不存在</h1>
      </div>
    );
  }

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileNode[], path = '') => {
    return (
      <div className="ml-4">
        {nodes.map((node, index) => {
          const nodePath = `${path}/${node.name}`;
          const isExpanded = expandedFolders.has(nodePath);

          return (
            <div key={index}>
              <button
                onClick={() => {
                  if (node.type === 'folder') {
                    toggleFolder(nodePath);
                  } else {
                    setSelectedFile(node);
                  }
                }}
                className={`flex items-center space-x-2 py-1.5 px-2 rounded hover:bg-slate-100 w-full text-left text-sm ${
                  selectedFile === node ? 'bg-purple-50 text-purple-600' : ''
                }`}
              >
                {node.type === 'folder' ? (
                  <>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <Folder className="w-4 h-4 text-yellow-500" />
                  </>
                ) : (
                  <>
                    <div className="w-4" />
                    <FileText className="w-4 h-4 text-blue-500" />
                  </>
                )}
                <span>{node.name}</span>
              </button>
              {node.type === 'folder' &&
                isExpanded &&
                node.children &&
                renderFileTree(node.children, nodePath)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-purple-600">
          首页
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700">{skill.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg">
                    {skill.category === 'content' && '创作运营'}
                    {skill.category === 'development' && '代码开发'}
                    {skill.category === 'design' && '平面设计'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg">
                    {skill.version}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                  {skill.name}
                </h1>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
              <img
                src={skill.author.avatar}
                alt={skill.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-slate-700">
                  {skill.author.name}
                </div>
                <div className="text-sm text-slate-500">
                  发布于 {skill.createdAt} · 更新于 {skill.updatedAt}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Eye className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-700">
                  {skill.stats.views.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">浏览量</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Download className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-700">
                  {skill.stats.downloads.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">下载量</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Heart className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-700">
                  {skill.stats.favorites.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">收藏数</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-slate-700">
                  {skill.stats.rating}
                </div>
                <div className="text-xs text-slate-500">
                  {skill.stats.ratingCount} 评价
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold text-lg mb-3">简介</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {skill.description}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="font-semibold mb-3">标签</h3>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Version Notes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-lg">版本说明</h2>
            </div>
            <div className="flex items-start space-x-3">
              <div className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                {skill.version}
              </div>
              <p className="text-slate-600">{skill.versionNotes}</p>
            </div>
          </div>

          {/* File Structure */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
            <h2 className="font-semibold text-lg mb-4">文件结构</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-sm">
                  {skill.files.length > 0 ? (
                    renderFileTree(skill.files)
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      暂无文件
                    </p>
                  )}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {selectedFile ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-slate-200">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">
                        {selectedFile.name}
                      </span>
                    </div>
                    <pre className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded overflow-x-auto">
                      {selectedFile.content || '// 文件内容预览'}
                    </pre>
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
                <h2 className="font-semibold text-lg text-green-900 mb-2">
                  安全性报告
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg font-medium">
                      安全
                    </div>
                    <span className="text-green-700 text-sm">
                      该 Skill 已通过安全性检测
                    </span>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>检测结果：</strong>
                    </p>
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
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
            <div className="flex items-center space-x-2 mb-6">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-lg">
                评论 ({mockComments.length})
              </h2>
            </div>

            {/* Comment Input */}
            <div className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="分享你的使用心得..."
                className="w-full border border-slate-200 rounded-lg p-4 outline-none focus:border-purple-500 transition-colors resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">
                  {comment.length} / 2000
                </span>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
                  发表评论
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {mockComments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-slate-700">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <button className="flex items-center space-x-1 hover:text-purple-600">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{comment.likes}</span>
                        </button>
                        <button className="hover:text-purple-600">回复</button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-12 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-3">
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-slate-700 text-sm">
                                {reply.author.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {reply.createdAt}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm mb-2">
                              {reply.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <button className="flex items-center space-x-1 hover:text-purple-600">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
                  isFavorite
                    ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-pink-600' : ''}`}
                />
                <span>{isFavorite ? '已收藏' : '收藏'}</span>
              </button>

              {/* Rating */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-2">为这个 Skill 评分</p>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setUserRating(rating)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= userRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* License */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="font-semibold mb-3">开源许可</h3>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    该 Skill 使用 <strong>MIT-0</strong> 许可证
                  </p>
                  <p className="text-xs text-slate-500">
                    您可以自由使用、修改和分发，无需署名
                  </p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="font-semibold mb-3">分享</h3>
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors">
                  Twitter
                </button>
                <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors">
                  复制链接
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
