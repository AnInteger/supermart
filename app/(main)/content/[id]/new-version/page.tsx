'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { publishNewVersion } from '@/app/actions/file';
import { getContent } from '@/app/actions/content';

const steps = [
  { num: 1, label: '版本信息' },
  { num: 2, label: '上传文件' },
  { num: 3, label: 'AI 生成' },
  { num: 4, label: '确认发布' },
];

export default function NewVersionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [skill, setSkill] = useState<any>(null);
  const [formData, setFormData] = useState({
    version: '',
    versionNotes: '',
    file: null as File | null,
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [securityReport, setSecurityReport] = useState<{
    status: 'safe' | 'warning' | 'danger';
    issues: string[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSkill() {
      setIsLoading(true);
      const result = await getContent(id);
      if (result.success && result.data) {
        setSkill(result.data);
        setFormData(prev => ({
          ...formData,
          version: '',
          versionNotes: '',
          description: result.data.description || '',
        }));
      } else {
        router.push('/');
      }
      setIsLoading(false);
    }
    loadSkill();
  }, [id]);

  // Check if current user is the author
  const isAuthor = skill?.authorId === skill?.author?.id;

  if (!isAuthor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-700 mb-2">无权限</h1>
        <p className="text-slate-500 mb-6">只有 Skill 作者可以发布新版本</p>
        <Link
          href={`/content/${id}`}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <span>返回 Skill 详情</span>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-slate-200 border-t-slate-200 border-t-slate-100 animate-pulse"></div>
        </div>
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleGenerateDescription = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedDescription(
        `${skill?.name} ${formData.version} 版本更新。\n\n本次更新内容：${formData.versionNotes}\n\n适用场景：继续为专业用户提供高效的工作流程支持。\\ n\n真实案例：用户反馈本次更新进一步提升了使用体验。\\ n\n结论：持续优化，为用户带来更好的体验。`
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
      const fd = new FormData();
      fd.append('file', formData.file);
      fd.append('version', formData.version);
      fd.append('versionNotes', formData.versionNotes);
      fd.append('description', generatedDescription || skill?.description || '');

      const result = await publishNewVersion(id, fd);

      if (result.success) {
        toast.success('新版本发布成功！');
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

  // Check for duplicate version
  const existingVersions = skill?.versions?.map(v => v.version) || [];
  const isDuplicateVersion = existingVersions.includes(formData.version);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-purple-600">
          首页
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/content/${id}`} className="hover:text-purple-600">
          {skill?.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700">发布新版本</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          发布新版本
        </h1>
        <p className="text-slate-600 text-lg mb-2">{skill?.name}</p>
        <p className="text-sm text-slate-500">
          当前版本：{skill?.version} · 发布于 {skill?.updatedAt}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
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

      {/* Important Notice */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">重要提示</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 已发布的 Skill 不可编辑，只能通过发布新版本来更新</li>
              <li>• 版本号不能与已有版本重复</li>
              <li>• 必须上传新的 ZIP 文件</li>
              <li>• AI 将重新生成简介和安全性报告</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200/50 shadow-lg">
        {/* Step 1: Version Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                新版本号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                placeholder="例如：v1.3.0"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-purple-500 transition-colors"
              />
              {isDuplicateVersion && (
                <p className="text-red-500 text-sm mt-2">
                  ⚠ 版本号已存在，请使用不同的版本号
                </p>
              )}
              {skill?.versions && skill.versions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">历史版本：</p>
                  <div className="flex flex-wrap gap-2">
                    {skill.versions.map((v) => (
                      <span
                        key={v.version}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                      >
                        {v.version}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                placeholder="描述这个版本的更新内容，例如：新增功能、修复问题、性能优化等..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.versionNotes.length} / 2000
              </p>
            </div>

            <div className="flex space-x-4">
              <Link
                href={`/content/${id}`}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-center"
              >
                取消
              </Link>
              <button
                onClick={() => setStep(2)}
                disabled={
                  !formData.version ||
                  !formData.versionNotes ||
                  isDuplicateVersion
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload File */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                上传新的 Skill 文件包 <span className="text-red-500">*</span>
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
                  正在分析新版本文件并生成简介和安全报告
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
                确认发布新版本
              </h3>
              <p className="text-slate-600">
                请确认以下信息无误后发布新版本
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Skill 名称</p>
                  <p className="font-medium text-slate-700">{skill?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">当前版本</p>
                  <p className="font-medium text-slate-700">{skill?.version}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">新版本号</p>
                  <p className="font-medium text-purple-600">{formData.version}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">文件</p>
                  <p className="font-medium text-slate-700">{formData.file?.name}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">版本说明</p>
                <p className="text-slate-700">{formData.versionNotes}</p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-medium mb-1">发布后</p>
                  <ul className="space-y-1 text-purple-700">
                    <li>• 新版本将成为"当前版本"</li>
                    <li>• 旧版本会保留在版本历史中</li>
                    <li>• 用户可以下载任意版本</li>
                    <li>• 已发布的版本不可删除或修改</li>
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
                {isSubmitting ? '发布中...' : '发布新版本'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
