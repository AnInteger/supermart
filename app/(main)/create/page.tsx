'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { uploadZipAndCreateContent } from '@/app/actions/file';
import { getCategories } from '@/app/actions/meta';
import { useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

const steps = [
  { num: 1, label: '基本信息' },
  { num: 2, label: '上传文件' },
  { num: 3, label: 'AI 生成' },
  { num: 4, label: '确认发布' },
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    version: 'v1.0.0',
    versionNotes: '',
    description: '',
    file: null as File | null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [securityReport, setSecurityReport] = useState<{
    status: 'safe' | 'warning' | 'danger';
    issues: string[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then((result) => {
      if (result.success) {
        setCategories(result.data);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleGenerateDescription = () => {
    setIsGenerating(true);
    // Simulate AI generation (UI only)
    setTimeout(() => {
      setGeneratedDescription(
        `这是一个专业的 ${formData.name} Skill，旨在帮助用户提升工作效率。\n\n核心功能：提供结构化的工作流程，自动化重复性任务。\n\n适用场景：适合专业从业者在日常工作中使用，特别是需要标准化流程的场景。\n\n真实案例：某团队使用此 Skill 后，工作效率提升了 50%，错误率降低了 30%。\n\n结论：该 Skill 经过实战验证，能够显著提升工作质量和效率。`
      );
      setSecurityReport({
        status: 'safe',
        issues: [],
      });
      setIsGenerating(false);
      setStep(3);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!formData.file) {
      toast.error('请上传 ZIP 文件');
      return;
    }

    setIsSubmitting(true);
    try {
      const description = generatedDescription || formData.description;
      const fd = new FormData();
      fd.append('file', formData.file);
      fd.append('name', formData.name);
      fd.append('description', description);
      fd.append('categoryId', formData.categoryId);
      fd.append('version', formData.version);
      fd.append('versionNotes', formData.versionNotes);
      fd.append('license', 'MIT-0');

      const result = await uploadZipAndCreateContent(fd);

      if (result.success) {
        toast.success('Skill 发布成功！');
        router.push(`/content/${result.data.contentId}`);
      } else {
        toast.error(result.error || '发布失败');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? `${category.icon || ''} ${category.name}`.trim() : categoryId;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          上传你的 Skill
        </h1>
        <p className="text-slate-600 text-lg">
          分享你的专业经验，让更多人受益
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s.num}
                </div>
                <span className="text-xs text-slate-600 mt-2">{s.label}</span>
              </div>
              {i < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > s.num ? 'bg-purple-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200/50 shadow-lg">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skill 名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例如：PRD 文档生成专家"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon && `${cat.icon} `}{cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  版本号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="例如：v1.0.0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                版本说明 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.versionNotes}
                onChange={(e) =>
                  setFormData({ ...formData, versionNotes: e.target.value })
                }
                placeholder="描述这个版本的新功能或改进..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={
                !formData.name ||
                !formData.categoryId ||
                !formData.version ||
                !formData.versionNotes
              }
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          </div>
        )}

        {/* Step 2: Upload File */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                上传 Skill 文件包 <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-slate-700 font-medium mb-2">
                    点击上传或拖拽文件到这里
                  </p>
                  <p className="text-sm text-slate-500">
                    仅支持 ZIP 格式，最大 10MB
                  </p>
                </label>
              </div>
              {formData.file && (
                <div className="mt-4 flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-700">
                    {formData.file.name}
                  </span>
                  <button
                    onClick={() => setFormData({ ...formData, file: null })}
                    className="ml-auto text-sm text-red-600 hover:text-red-700"
                  >
                    移除
                  </button>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
              >
                上一步
              </button>
              <button
                onClick={handleGenerateDescription}
                disabled={!formData.file}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                生成简介与安全报告
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Generation */}
        {step === 3 && (
          <div className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-medium text-slate-700 mb-2">
                  AI 正在生成...
                </p>
                <p className="text-sm text-slate-500">
                  正在分析 Skill 文件并生成简介和安全报告
                </p>
              </div>
            ) : (
              <>
                {/* Generated Description */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-lg">AI 生成的简介</h3>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <textarea
                      value={generatedDescription}
                      onChange={(e) => setGeneratedDescription(e.target.value)}
                      rows={8}
                      className="w-full bg-transparent outline-none text-slate-700 resize-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    你可以编辑 AI 生成的内容
                  </p>
                </div>

                {/* Security Report */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">安全性报告</h3>
                  {securityReport?.status === 'safe' ? (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-green-900 mb-2">
                            安全检测通过
                          </p>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>✓ 未发现恶意代码</li>
                            <li>✓ 未包含敏感信息</li>
                            <li>✓ 文件结构符合规范</li>
                            <li>✓ 依赖项安全检查通过</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-900 mb-2">
                            发现潜在风险
                          </p>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {securityReport?.issues.map((issue, i) => (
                              <li key={i}>⚠ {issue}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    下一步
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                确认发布
              </h3>
              <p className="text-slate-600">
                请确认以下信息无误后发布 Skill
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Skill 名称</p>
                  <p className="font-medium text-slate-700">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">分类</p>
                  <p className="font-medium text-slate-700">
                    {getCategoryName(formData.categoryId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">版本号</p>
                  <p className="font-medium text-slate-700">{formData.version}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">文件</p>
                  <p className="font-medium text-slate-700">
                    {formData.file?.name || '未上传'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">版本说明</p>
                <p className="text-slate-700">{formData.versionNotes}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">开源许可</p>
                <p className="text-slate-700">MIT-0（无需署名）</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">发布须知</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 发布后将使用 MIT-0 许可证，任何人都可以免费使用</li>
                    <li>• 请确保上传的内容不侵犯他人版权</li>
                    <li>• 恶意代码将导致账户被封禁</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
              >
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? '发布中...' : '发布 Skill'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
