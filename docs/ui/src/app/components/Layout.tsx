import { Link, Outlet, useLocation } from 'react-router';
import { Upload, User, Search, Github } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  SuperMart
                </h1>
                <p className="text-xs text-slate-500">Skill 平台</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-slate-600 hover:text-purple-600 transition-colors"
              >
                探索
              </Link>
              <a
                href="#"
                className="text-slate-600 hover:text-purple-600 transition-colors"
              >
                分类
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-purple-600 transition-colors"
              >
                社区
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-purple-600 transition-colors"
              >
                文档
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Link
                to="/upload"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>上传 Skill</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <User className="w-5 h-5 text-slate-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg">SuperMart</h2>
                  <p className="text-sm text-slate-500">让专业知识规模化复用</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                SuperMart 是一个面向专业从业者的 UGC 平台，让各领域的专家能够将工作流程转换为 Skill 工作流，实现行业知识的规模化复用。
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-purple-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    探索 Skill
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    上传 Skill
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    定价
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    文档
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    社区
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    联系我们
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-600 transition-colors">
                    状态
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© 2024 SuperMart. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-purple-600 transition-colors">
                隐私政策
              </a>
              <a href="#" className="hover:text-purple-600 transition-colors">
                服务条款
              </a>
              <a href="#" className="hover:text-purple-600 transition-colors">
                MIT-0 许可证
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
