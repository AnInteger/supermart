'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types/api';

// @ts-ignore
import JSZip from 'jszip';

export interface UploadZipResult {
  contentId: string;
  files: {
    id: string;
    filename: string;
    path: string;
    size: number;
    type: string;
  }[];
}

// 获取 MIME 类型
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  const mimeTypes: Record<string, string> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.ts': 'application/typescript',
    '.jsx': 'application/javascript',
    '.tsx': 'application/typescript',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.scss': 'text/x-scss',
    '.sass': 'text/x-sass',
    '.less': 'text/x-less',
    '.py': 'text/x-python',
    '.go': 'text/x-go',
    '.rs': 'text/x-rust',
    '.java': 'text/x-java',
    '.kt': 'text/x-kotlin',
    '.swift': 'text/x-swift',
    '.c': 'text/x-c',
    '.cpp': 'text/x-c++',
    '.h': 'text/x-c',
    '.hpp': 'text/x-c++',
    '.cs': 'text/x-csharp',
    '.rb': 'text/x-ruby',
    '.php': 'text/x-php',
    '.yaml': 'application/x-yaml',
    '.yml': 'application/x-yaml',
    '.xml': 'application/xml',
    '.svg': 'image/svg+xml',
    '.sql': 'application/sql',
    '.sh': 'application/x-sh',
    '.bash': 'application/x-sh',
    '.zsh': 'application/x-sh',
    '.env': 'text/plain',
    '.gitignore': 'text/plain',
    '.dockerignore': 'text/plain',
    '.prettierrc': 'application/json',
    '.eslintrc': 'application/json',
    '.eslintrc.json': 'application/json',
    '.prettierrc.json': 'application/json',
    'prisma': 'text/prisma',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 判断是否为文本文件（可以预览）
function isTextFile(filename: string, mimeType: string): boolean {
  const textExtensions = [
    '.txt', '.md', '.markdown', '.json', '.js', '.mjs', '.ts', '.jsx', '.tsx',
    '.html', '.htm', '.css', '.scss', '.sass', '.less',
    '.yaml', '.yml', '.xml', '.svg',
    '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
    '.c', '.cpp', '.h', '.hpp', '.cs', '.php',
    '.sh', '.bash', '.zsh',
    '.sql', '.prisma',
    '.env', '.gitignore', '.dockerignore',
    '.prettierrc', '.eslintrc', '.eslintrc.json', '.prettierrc.json',
  ];

  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  if (textExtensions.includes(ext)) {
    return true;
  }

  // 检查 MIME 类型
  if (mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/javascript' ||
      mimeType === 'application/xml' ||
      mimeType === 'application/x-yaml') {
    return true;
  }

  return false;
}

// 判断是否应该跳过的文件
function shouldSkipFile(path: string): boolean {
  const skipPatterns = [
    '__MACOSX/',
    '.DS_Store',
    'Thumbs.db',
    '.git/',
    '.gitignore',
    'node_modules/',
    '.env.local',
    '.env.development.local',
    '.env.production.local',
    '.env.test.local',
  ];

  const lowerPath = path.toLowerCase();
  return skipPatterns.some(pattern => lowerPath.includes(pattern.toLowerCase()));
}

/**
 * 上传并解压 zip 文件，创建 Skill 内容
 */
export async function uploadZipAndCreateContent(
  formData: FormData
): Promise<ApiResponse<UploadZipResult>> {
  console.log('=== uploadZipAndCreateContent started ===');

  const session = await auth();
  if (!session?.user?.id) {
    console.log('Error: User not authenticated');
    return { success: false, error: '请先登录', code: 'UNAUTHORIZED' };
  }
  console.log('User authenticated:', session.user.id);

  const file = formData.get('file') as File | null;
  const name = formData.get('name') as string | null;
  const description = formData.get('description') as string | null;
  const categoryId = formData.get('categoryId') as string | null;
  const version = formData.get('version') as string | null;
  const versionNotes = formData.get('versionNotes') as string | null;
  const license = formData.get('license') as string | null;

  console.log('Form data:', { name, categoryId, version, hasFile: !!file, fileName: file?.name });

  if (!file) {
    return { success: false, error: '请上传文件', code: 'VALIDATION_ERROR' };
  }

  if (!name) {
    return { success: false, error: '请填写名称', code: 'VALIDATION_ERROR' };
  }

  if (!categoryId) {
    return { success: false, error: '请选择分类', code: 'VALIDATION_ERROR' };
  }

  if (!file.name.toLowerCase().endsWith('.zip')) {
    return { success: false, error: '只支持 ZIP 格式文件', code: 'VALIDATION_ERROR' };
  }

  try {
    console.log('Reading zip file...');
    // 读取 zip 文件
    const buffer = await file.arrayBuffer();
    console.log('File buffer size:', buffer.byteLength);

    const zip = await JSZip.loadAsync(buffer);
    console.log('Zip loaded successfully');

    // 解析文件结构
    const filesData: Array<{
      filename: string;
      path: string;
      fileContent: string | null;
      type: string;
      size: number;
    }> = [];

    const zipFiles = zip.files;
    console.log('Zip entries count:', Object.keys(zipFiles).length);

    for (const [path, zipEntry] of Object.entries(zipFiles)) {
      // 跳过目录和不需要的文件
      if (zipEntry.dir || shouldSkipFile(path)) {
        console.log('Skipping:', path);
        continue;
      }

      const filename = path.split('/').pop() || path;
      const mimeType = getMimeType(filename);

      console.log('Processing file:', path, 'type:', mimeType);

      // 读取文件内容
      let size = 0;
      let fileContent: string | null = null;

      try {
        const content = await zipEntry.async('uint8array');
        size = content.length;
        console.log('File size:', size);

        // 如果是文本文件，读取内容
        if (isTextFile(filename, mimeType) && size < 100000) {
          fileContent = await zipEntry.async('string');
          console.log('Text content loaded, length:', fileContent.length);
        }
      } catch (readError) {
        console.error('Error reading file:', path, readError);
        continue;
      }

      filesData.push({
        filename,
        path,
        fileContent,
        type: mimeType,
        size,
      });
    }

    console.log('Total files to save:', filesData.length);

    if (filesData.length === 0) {
      return { success: false, error: 'ZIP 文件中没有有效的文件', code: 'VALIDATION_ERROR' };
    }

    // 创建内容记录
    console.log('Creating content in database...');
    const content = await prisma.content.create({
      data: {
        name,
        description: description || '',
        categoryId,
        version: version || 'v1.0.0',
        versionNotes: versionNotes || null,
        license: license || 'MIT-0',
        authorId: session.user.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        files: {
          create: filesData.map(f => ({
            filename: f.filename,
            path: f.path,
            fileContent: f.fileContent,
            type: f.type,
            size: f.size,
          })),
        },
      },
      include: {
        files: true,
      },
    });

    console.log('Content created successfully:', content.id);

    return {
      success: true,
      data: {
        contentId: content.id,
        files: content.files.map(f => ({
          id: f.id,
          filename: f.filename,
          path: f.path,
          size: f.size,
          type: f.type,
        })),
      },
    };
  } catch (error) {
    console.error('Upload zip error:', error);
    const errorMessage = error instanceof Error ? error.message : '上传处理失败';
    return { success: false, error: errorMessage, code: 'INTERNAL_ERROR' };
  }
}

/**
 * 获取文件内容（用于预览）
 */
export async function getFileContent(fileId: string): Promise<ApiResponse<{ content: string; filename: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: '请先登录', code: 'UNAUTHORIZED' };
  }

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { content: true },
    });

    if (!file) {
      return { success: false, error: '文件不存在', code: 'NOT_FOUND' };
    }

    return {
      success: true,
      data: {
        content: file.fileContent || '',
        filename: file.filename,
      },
    };
  } catch (error) {
    console.error('Get file content error:', error);
    return { success: false, error: '获取文件内容失败', code: 'INTERNAL_ERROR' };
  }
}
