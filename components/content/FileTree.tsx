'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FileCode, FileJson, File } from 'lucide-react';
import { ContentFile } from '@/types/api';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  file?: ContentFile;
}

interface FileTreeProps {
  files: ContentFile[];
  onSelectFile?: (file: ContentFile) => void;
}

// 根据文件路径构建树结构
function buildFileTree(files: ContentFile[]): FileNode[] {
  const root: FileNode = { name: '', path: '', type: 'folder', children: [] };

  files.forEach(file => {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const childPath = parts.slice(0, index + 1).join('/');

      let child = current.children?.find(c => c.name === part);

      if (!child) {
        child = {
          name: part,
          path: childPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          file: isFile ? file : undefined,
        };
        current.children = current.children || [];
        current.children.push(child);
      }

      if (!isFile) {
        current = child;
      }
    });
  });

  // 排序：文件夹在前，文件在后，按字母排序
  const sortChildren = (nodes: FileNode[]): FileNode[] => {
    return nodes
      .map(node => ({
        ...node,
        children: node.children ? sortChildren(node.children) : undefined,
      }))
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  };

  return sortChildren(root.children || []);
}

// 获取文件图标
function getFileIcon(filename: string, type: string) {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));

  const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h'];
  const jsonExtensions = ['.json', '.yaml', '.yml'];

  if (codeExtensions.includes(ext)) {
    return <FileCode className="w-4 h-4 text-blue-500" />;
  }
  if (jsonExtensions.includes(ext)) {
    return <FileJson className="w-4 h-4 text-yellow-500" />;
  }
  if (ext === '.md') {
    return <FileText className="w-4 h-4 text-slate-500" />;
  }

  return <File className="w-4 h-4 text-slate-400" />;
}

export function FileTree({ files: contentFiles, onSelectFile }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const fileTree = useMemo(() => buildFileTree(contentFiles), [contentFiles]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleFileSelect = (node: FileNode) => {
    setSelectedPath(node.path);
    if (node.file && onSelectFile) {
      onSelectFile(node.file);
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return (
      <div className="ml-2">
        {nodes.map((node) => {
          const isExpanded = expandedFolders.has(node.path);
          const isSelected = selectedPath === node.path;

          return (
            <div key={node.path}>
              <button
                onClick={() => {
                  if (node.type === 'folder') {
                    toggleFolder(node.path);
                  } else {
                    handleFileSelect(node);
                  }
                }}
                className={`flex items-center space-x-2 py-1.5 px-2 rounded hover:bg-slate-100 w-full text-left text-sm ${
                  isSelected ? 'bg-purple-50 text-purple-600' : ''
                }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
              >
                {node.type === 'folder' ? (
                  <>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <div className="w-4 flex-shrink-0" />
                    {getFileIcon(node.name, node.file?.type || '')}
                  </>
                )}
                <span className="truncate">{node.name}</span>
              </button>
              {node.type === 'folder' &&
                isExpanded &&
                node.children &&
                renderFileTree(node.children, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  if (contentFiles.length === 0) {
    return (
      <div className="text-slate-400 text-sm text-center py-8">
        暂无文件
      </div>
    );
  }

  return (
    <div className="font-mono text-sm">
      {renderFileTree(fileTree)}
    </div>
  );
}
