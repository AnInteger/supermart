import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
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
            <p className="text-slate-600 text-sm mb-4 max-w-md">
              SuperMart 是一个面向专业从业者的 UGC 平台，让各领域的专家能够将工作流程转换为 Skill 工作流，实现行业知识的规模化复用。
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-purple-600 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">产品</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="/" className="hover:text-purple-600 transition-colors">
                  探索 Skill
                </a>
              </li>
              <li>
                <a href="/create" className="hover:text-purple-600 transition-colors">
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

          {/* Support Links */}
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

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} SuperMart. All rights reserved.</p>
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
  );
}
