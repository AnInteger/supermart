export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  versionNotes: string;
  author: {
    name: string;
    avatar: string;
  };
  stats: {
    views: number;
    downloads: number;
    favorites: number;
    rating: number;
    ratingCount: number;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
  files: FileNode[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

export const categories = [
  { id: 'all', name: '全部分类', icon: '🎯' },
  { id: 'content', name: '创作运营', icon: '✍️' },
  { id: 'development', name: '代码开发', icon: '💻' },
  { id: 'design', name: '平面设计', icon: '🎨' },
];

export const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'PRD 文档生成专家',
    description: '这个 Skill 可以帮助产品经理快速生成结构化的 PRD 文档。它会引导你填写产品背景、用户画像、功能需求等核心内容，并自动生成符合行业标准的文档格式。适用于互联网产品经理、创业者等角色。真实案例：某创业公司使用此 Skill 在 2 小时内完成了新产品的 PRD 撰写，比传统方式节省了 70% 的时间。结论：该 Skill 能够显著提升 PRD 撰写效率，适合快速迭代的团队使用。',
    category: 'content',
    version: 'v1.2.0',
    versionNotes: '优化了用户画像模块，增加了更多行业模板',
    author: {
      name: '李明',
      avatar: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMzI0MTYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    stats: {
      views: 2847,
      downloads: 456,
      favorites: 123,
      rating: 4.8,
      ratingCount: 89,
    },
    createdAt: '2024-02-15',
    updatedAt: '2024-03-10',
    tags: ['产品管理', 'PRD', '文档生成'],
    files: [
      {
        name: 'skill.json',
        type: 'file',
        content: `{
  "name": "PRD 文档生成专家",
  "version": "1.2.0",
  "description": "帮助产品经理快速生成结构化的 PRD 文档"
}`,
      },
      {
        name: 'prompts',
        type: 'folder',
        children: [
          {
            name: 'main.txt',
            type: 'file',
            content: '你是一位经验丰富的产品经理，擅长撰写结构化的 PRD 文档...',
          },
          {
            name: 'templates.txt',
            type: 'file',
            content: '# PRD 模板\n## 产品背景\n## 用户画像\n## 功能需求...',
          },
        ],
      },
      {
        name: 'README.md',
        type: 'file',
        content: '# PRD 文档生成专家\n\n使用说明：\n1. 准备好产品基本信息\n2. 按照提示逐步填写\n3. 自动生成完整文档',
      },
    ],
  },
  {
    id: '2',
    name: '代码审查助手',
    description: '专业的代码审查 Skill，基于业界最佳实践和编码规范，自动检查代码质量、性能问题、安全漏洞等。支持多种编程语言，包括 JavaScript、Python、Java 等。真实案例：某技术团队使用此 Skill 后，代码 bug 率降低了 40%，代码审查时间减少了 60%。结论：该 Skill 能够有效提升代码质量，是开发团队必备工具。',
    category: 'development',
    version: 'v2.0.1',
    versionNotes: '新增 TypeScript 支持，优化性能检测算法',
    author: {
      name: '王强',
      avatar: 'https://images.unsplash.com/photo-1752170080627-0324ede1ddf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBkZXZlbG9wZXJ8ZW58MXx8fHwxNzczMzg2NTA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    stats: {
      views: 3921,
      downloads: 678,
      favorites: 234,
      rating: 4.9,
      ratingCount: 156,
    },
    createdAt: '2024-01-20',
    updatedAt: '2024-03-08',
    tags: ['代码审查', '质量控制', 'DevOps'],
    files: [
      {
        name: 'skill.json',
        type: 'file',
        content: '{"name": "代码审查助手", "version": "2.0.1"}',
      },
      {
        name: 'rules',
        type: 'folder',
        children: [
          { name: 'javascript.yaml', type: 'file' },
          { name: 'python.yaml', type: 'file' },
          { name: 'security.yaml', type: 'file' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: '视频字幕批量翻译',
    description: '高效的字幕翻译 Skill，支持批量处理 SRT、VTT 等主流字幕格式。可一键将字幕翻译成英语、日语、韩语等多种语言，保持原有时间轴和格式。真实案例：某 UP 主使用此 Skill 将 100 个视频的字幕翻译成 5 种语言，仅用时 3 小时，比人工翻译节省了 95% 的成本。结论：该 Skill 是内容创作者国际化的得力助手。',
    category: 'content',
    version: 'v1.5.2',
    versionNotes: '支持更多字幕格式，优化翻译质量',
    author: {
      name: '张伟',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    stats: {
      views: 1856,
      downloads: 389,
      favorites: 145,
      rating: 4.7,
      ratingCount: 67,
    },
    createdAt: '2024-02-28',
    updatedAt: '2024-03-12',
    tags: ['字幕翻译', '视频制作', '本地化'],
    files: [],
  },
  {
    id: '4',
    name: 'UI 设计规范生成器',
    description: '自动将 Figma 设计稿转换为开发可用的设计规范文档。包含颜色系统、字体规范、间距体系、组件库等完整内容，支持导出 CSS 变量和代码片段。真实案例：某设计团队使用此 Skill 后，设计到开发的交接时间从 2 天缩短到 2 小时。结论：该 Skill 能够大幅提升设计开发协作效率。',
    category: 'design',
    version: 'v1.0.8',
    versionNotes: '新增组件库导出功能',
    author: {
      name: '刘芳',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    stats: {
      views: 1432,
      downloads: 267,
      favorites: 98,
      rating: 4.6,
      ratingCount: 45,
    },
    createdAt: '2024-03-01',
    updatedAt: '2024-03-11',
    tags: ['设计规范', 'Figma', 'Design System'],
    files: [],
  },
  {
    id: '5',
    name: '竞品分析报告生成器',
    description: '专业的竞品分析 Skill，只需输入竞品网址或产品名称，即可自动生成结构化的竞品分析报告。包含产品定位、核心功能、用户体验、商业模式等多维度分析。真实案例：某市场分析师使用此 Skill 每周产出 5 份高质量竞品分析报告，分析深度和广度都超过了传统方式。结论：该 Skill 是产品和市场人员的必备工具。',
    category: 'content',
    version: 'v1.3.0',
    versionNotes: '增加商业模式分析模块',
    author: {
      name: '陈静',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
    stats: {
      views: 2156,
      downloads: 423,
      favorites: 167,
      rating: 4.8,
      ratingCount: 78,
    },
    createdAt: '2024-02-10',
    updatedAt: '2024-03-09',
    tags: ['竞品分析', '市场研究', '产品策略'],
    files: [],
  },
  {
    id: '6',
    name: 'API 文档自动生成',
    description: '从代码注释和类型定义自动生成专业的 API 文档。支持 RESTful 和 GraphQL 接口，自动提取参数、返回值、错误码等信息，生成 Markdown 或 HTML 格式的文档。真实案例：某技术团队使用此 Skill 后，API 文档维护成本降低了 80%，文档准确性提升了 90%。结论：该 Skill 能够确保 API 文档与代码保持同步。',
    category: 'development',
    version: 'v1.1.5',
    versionNotes: '支持 GraphQL，优化文档样式',
    author: {
      name: '赵磊',
      avatar: 'https://i.pravatar.cc/150?img=14',
    },
    stats: {
      views: 1678,
      downloads: 312,
      favorites: 134,
      rating: 4.7,
      ratingCount: 56,
    },
    createdAt: '2024-02-22',
    updatedAt: '2024-03-07',
    tags: ['API文档', '自动化', '开发工具'],
    files: [],
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      name: '小明',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    content: '这个 Skill 太好用了！用它生成的 PRD 文档非常专业，节省了我大量时间。强烈推荐给其他产品经理！',
    createdAt: '2024-03-12',
    likes: 24,
    replies: [
      {
        id: '1-1',
        author: {
          name: '李明',
          avatar: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMzI0MTYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
        },
        content: '感谢支持！很高兴能帮到你 😊',
        createdAt: '2024-03-12',
        likes: 8,
      },
    ],
  },
  {
    id: '2',
    author: {
      name: '王芳',
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
    content: '有个小建议：希望能增加更多垂直行业的模板，比如金融、医疗等领域的 PRD 模板。',
    createdAt: '2024-03-11',
    likes: 15,
  },
  {
    id: '3',
    author: {
      name: '张强',
      avatar: 'https://i.pravatar.cc/150?img=7',
    },
    content: '作为新手产品经理，这个 Skill 帮我快速掌握了 PRD 的撰写规范。五星好评！',
    createdAt: '2024-03-10',
    likes: 18,
  },
];

export const sortOptions = [
  { id: 'latest', name: '最新发布' },
  { id: 'downloads', name: '最多下载' },
  { id: 'favorites', name: '最多收藏' },
  { id: 'rating', name: '最高评分' },
];
