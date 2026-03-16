import { useState } from 'react';
import { Link } from 'react-router';
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Heart,
  Upload,
  Settings,
  LogOut,
  Download,
  Eye,
  Star,
  Plus,
} from 'lucide-react';
import { mockSkills, CURRENT_USER_ID } from '../data/mockData';

export function Profile() {
  const [activeTab, setActiveTab] = useState<'uploaded' | 'favorites'>('uploaded');

  // Mock user data
  const userData = {
    name: '李明',
    email: 'liming@example.com',
    avatar:
      'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMzI0MTYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: '资深产品经理，专注于 B 端产品设计与用户体验优化。喜欢分享工作经验，帮助更多人提升效率。',
    joinDate: '2024-01-15',
    stats: {
      uploaded: 3,
      favorites: 12,
      downloads: 456,
      totalViews: 5432,
    },
  };

  const uploadedSkills = mockSkills.filter(
    (skill) => skill.author.id === CURRENT_USER_ID
  );
  const favoriteSkills = mockSkills.filter(
    (skill) => skill.favoritedBy?.includes(CURRENT_USER_ID)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 sticky top-24">
            {/* Profile Header */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-24 h-24 rounded-full mx-auto"
                />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                {userData.name}
              </h2>
              <p className="text-slate-500 text-sm mb-4">{userData.email}</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                {userData.bio}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {userData.stats.uploaded}
                </div>
                <div className="text-xs text-slate-600">上传的 Skill</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-pink-600 mb-1">
                  {userData.stats.favorites}
                </div>
                <div className="text-xs text-slate-600">收藏的 Skill</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {userData.stats.downloads}
                </div>
                <div className="text-xs text-slate-600">总下载量</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {userData.stats.totalViews.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600">总浏览量</div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <Mail className="w-4 h-4" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>加入于 {userData.joinDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-700">
                <Settings className="w-4 h-4" />
                <span className="text-sm">账户设置</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-700">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">退出登录</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/50 mb-6">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('uploaded')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'uploaded'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>我上传的 ({userData.stats.uploaded})</span>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>我的收藏 ({userData.stats.favorites})</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'uploaded' && (
              <>
                {uploadedSkills.length > 0 ? (
                  uploadedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Link
                            to={`/skill/${skill.id}`}
                            className="text-lg font-semibold text-slate-800 hover:text-purple-600 transition-colors"
                          >
                            {skill.name}
                          </Link>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {skill.category === 'content' && '创作运营'}
                              {skill.category === 'development' && '代码开发'}
                              {skill.category === 'design' && '平面设计'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {skill.version}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">
                              {skill.updatedAt}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/skill/${skill.id}/new-version`}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>新版本</span>
                          </Link>
                          <Link
                            to={`/skill/${skill.id}`}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors"
                          >
                            查看
                          </Link>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {skill.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{skill.stats.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="w-3.5 h-3.5" />
                            <span>{skill.stats.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{skill.stats.favorites.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-slate-700">
                            {skill.stats.rating}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({skill.stats.ratingCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-12 border border-slate-200/50 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      还没有上传 Skill
                    </h3>
                    <p className="text-slate-500 mb-4">
                      分享你的专业经验，让更多人受益
                    </p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>上传 Skill</span>
                    </Link>
                  </div>
                )}
              </>
            )}

            {activeTab === 'favorites' && (
              <>
                {favoriteSkills.length > 0 ? (
                  favoriteSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Link
                            to={`/skill/${skill.id}`}
                            className="text-lg font-semibold text-slate-800 hover:text-purple-600 transition-colors"
                          >
                            {skill.name}
                          </Link>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {skill.category === 'content' && '创作运营'}
                              {skill.category === 'development' && '代码开发'}
                              {skill.category === 'design' && '平面设计'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {skill.version}
                            </span>
                          </div>
                        </div>
                        <button className="text-pink-600 hover:text-pink-700">
                          <Heart className="w-5 h-5 fill-pink-600" />
                        </button>
                      </div>

                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {skill.description}
                      </p>

                      {/* Author */}
                      <div className="flex items-center space-x-2 mb-4">
                        <img
                          src={skill.author.avatar}
                          alt={skill.author.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-slate-600">
                          {skill.author.name}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{skill.stats.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="w-3.5 h-3.5" />
                            <span>{skill.stats.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{skill.stats.favorites.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-slate-700">
                            {skill.stats.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-12 border border-slate-200/50 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      还没有收藏
                    </h3>
                    <p className="text-slate-500 mb-4">
                      发现喜欢的 Skill 并收藏起来吧
                    </p>
                    <Link
                      to="/"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <span>浏览 Skill</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}