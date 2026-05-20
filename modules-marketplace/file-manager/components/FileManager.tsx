import React, { useState, useMemo, useCallback } from 'react';
import {
  Folder, File, FileText, Image, Music, Video, Code,
  ChevronRight, ChevronDown, Search, LayoutGrid, List,
  Trash2, Move, Pencil, Download, Upload,
  FolderPlus, Filter, MoreVertical,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: number;
  path: string;
  children?: FileItem[];
  selected?: boolean;
}

interface FileManagerProps {
  files: FileItem[];
  rootName?: string;
  defaultView?: 'list' | 'grid';
  availableActions?: ('delete' | 'move' | 'rename' | 'download' | 'upload' | 'new-folder')[];
  iconMap?: Record<string, React.ComponentType<{ className?: string }>>;
  className?: string;
  onFileSelect?: (file: FileItem) => void;
  onFileAction?: (action: string, files: FileItem[]) => void;
  onNavigate?: (path: string) => void;
  dataProvider?: () => Promise<FileItem[]>;
}

// ─── Icon Mapping ─────────────────────────────────────────────
const DEFAULT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  txt: FileText,
  md: FileText,
  json: Code,
  ts: Code,
  tsx: Code,
  js: Code,
  jsx: Code,
  py: Code,
  css: Code,
  png: Image,
  jpg: Image,
  gif: Image,
  svg: Image,
  mp3: Music,
  wav: Music,
  mp4: Video,
  mov: Video,
};

const getFileIcon = (file: FileItem, iconMap?: Record<string, React.ComponentType<{ className?: string }>>): React.ComponentType<{ className?: string }> => {
  if (file.type === 'folder') return Folder;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return (iconMap || DEFAULT_ICON_MAP)[ext] || File;
};

// ─── Formatters ───────────────────────────────────────────────
const formatSize = (bytes?: number): string => {
  if (!bytes) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDate = (ts?: number): string => {
  if (!ts) return '--';
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Breadcrumb ───────────────────────────────────────────────
interface BreadcrumbProps {
  path: string;
  rootName: string;
  onNavigate: (path: string) => void;
}

function Breadcrumb({ path, rootName, onNavigate }: BreadcrumbProps) {
  const segments = path.split('/').filter(Boolean);
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
      <button onClick={() => onNavigate('/')} className="hover:text-gray-900 dark:hover:text-gray-200">
        {rootName}
      </button>
      {segments.map((seg, i) => {
        const subPath = '/' + segments.slice(0, i + 1).join('/') + '/';
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => onNavigate(subPath)}
              className="hover:text-gray-900 dark:hover:text-gray-200"
            >
              {seg}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

// ─── File Row (List View) ─────────────────────────────────────
interface FileRowProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: (file: FileItem) => void;
  onToggleExpand?: (file: FileItem) => void;
  isExpanded?: boolean;
  depth?: number;
}

function FileRow({ file, isSelected, onSelect, onToggleExpand, isExpanded, depth = 0 }: FileRowProps) {
  const Icon = getFileIcon(file);
  return (
    <tr
      onClick={() => onSelect(file)}
      className={`border-b border-gray-100 dark:border-gray-700/50 transition-colors cursor-pointer ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
      }`}
    >
      <td className="px-3 py-2.5" style={{ paddingLeft: `${depth * 20 + 12}px` }}>
        <div className="flex items-center gap-2">
          {file.type === 'folder' && onToggleExpand && (
            <button onClick={(e) => { e.stopPropagation(); onToggleExpand(file); }}>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <Icon className={`w-4 h-4 ${file.type === 'folder' ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-[250px]">{file.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 text-right">
        {file.type === 'folder' ? '--' : formatSize(file.size)}
      </td>
      <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 text-right hidden md:table-cell">
        {formatDate(file.modified)}
      </td>
      <td className="px-3 py-2.5 text-right">
        <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </td>
    </tr>
  );
}

// ─── File Card (Grid View) ────────────────────────────────────
interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: (file: FileItem) => void;
}

function FileCard({ file, isSelected, onSelect }: FileCardProps) {
  const Icon = getFileIcon(file);
  return (
    <div
      onClick={() => onSelect(file)}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'
      }`}
    >
      <Icon className={`w-10 h-10 mb-2 ${file.type === 'folder' ? 'text-yellow-500' : 'text-gray-400'}`} />
      <span className="text-sm text-gray-800 dark:text-gray-200 text-center truncate w-full">{file.name}</span>
      <span className="text-xs text-gray-400 mt-1">{file.type === 'folder' ? '文件夹' : formatSize(file.size)}</span>
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────
interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  selectedCount: number;
  actions?: string[];
  onAction: (action: string) => void;
}

function Toolbar({ searchTerm, onSearchChange, viewMode, onViewModeChange, selectedCount, actions, onAction }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索文件..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
          />
        </div>
        {selectedCount > 0 && (
          <span className="text-sm text-blue-600 dark:text-blue-400">
            已选 {selectedCount} 项
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {actions?.includes('upload') && (
          <button onClick={() => onAction('upload')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="上传">
            <Upload className="w-4 h-4" />
          </button>
        )}
        {actions?.includes('new-folder') && (
          <button onClick={() => onAction('new-folder')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="新建文件夹">
            <FolderPlus className="w-4 h-4" />
          </button>
        )}
        {selectedCount > 0 && actions?.includes('delete') && (
          <button onClick={() => onAction('delete')} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="删除">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          title="列表视图"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          title="网格视图"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── FileManager (Main Component) ─────────────────────────────
export function FileManager({
  files,
  rootName = '根目录',
  defaultView = 'list',
  availableActions = ['delete', 'move', 'rename', 'download', 'upload', 'new-folder'],
  iconMap,
  className = '',
  onFileSelect,
  onFileAction,
  onNavigate,
  dataProvider,
}: FileManagerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(defaultView);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Flatten files based on current path
  const currentFiles = useMemo(() => {
    let current = files;
    const segments = currentPath.split('/').filter(Boolean);
    for (const seg of segments) {
      const folder = current.find((f) => f.type === 'folder' && f.name === seg);
      if (folder?.children) {
        current = folder.children;
      } else {
        break;
      }
    }
    return current;
  }, [files, currentPath]);

  // Filter
  const filteredFiles = useMemo(() => {
    if (!searchTerm) return currentFiles;
    const term = searchTerm.toLowerCase();
    return currentFiles.filter((f) => f.name.toLowerCase().includes(term));
  }, [currentFiles, searchTerm]);

  // Sort: folders first, then alphabetically
  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredFiles]);

  const toggleExpand = useCallback((file: FileItem) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(file.id)) next.delete(file.id);
      else next.add(file.id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((file: FileItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(file.id)) next.delete(file.id);
      else next.add(file.id);
      return next;
    });
    onFileSelect?.(file);

    if (file.type === 'folder') {
      const newPath = currentPath === '/' ? `/${file.name}/` : `${currentPath}${file.name}/`;
      setCurrentPath(newPath);
      onNavigate?.(newPath);
    }
  }, [currentPath, onFileSelect, onNavigate]);

  const handleNavigate = useCallback((path: string) => {
    setCurrentPath(path);
    setSelectedIds(new Set());
    onNavigate?.(path);
  }, [onNavigate]);

  const handleAction = useCallback((action: string) => {
    const selectedFiles = files.filter((f) => selectedIds.has(f.id));
    onFileAction?.(action, selectedFiles);
    if (action === 'delete' || action === 'move') {
      setSelectedIds(new Set());
    }
  }, [files, selectedIds, onFileAction]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      {/* Breadcrumb */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <Breadcrumb path={currentPath} rootName={rootName} onNavigate={handleNavigate} />
      </div>

      {/* Toolbar */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedIds.size}
        actions={availableActions}
        onAction={handleAction}
      />

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">名称</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400 w-24">大小</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400 w-36 hidden md:table-cell">修改时间</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map((file) => {
                const depth = currentPath.split('/').filter(Boolean).length;
                return (
                  <FileRow
                    key={file.id}
                    file={file}
                    isSelected={selectedIds.has(file.id)}
                    onSelect={handleSelect}
                    onToggleExpand={file.type === 'folder' ? toggleExpand : undefined}
                    isExpanded={expandedFolders.has(file.id)}
                    depth={depth}
                  />
                );
              })}
            </tbody>
          </table>
          {sortedFiles.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              {searchTerm ? '没有找到匹配的文件' : '空目录'}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isSelected={selectedIds.has(file.id)}
              onSelect={handleSelect}
            />
          ))}
          {sortedFiles.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
              {searchTerm ? '没有找到匹配的文件' : '空目录'}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
        <span>{sortedFiles.length} 个项目</span>
        <span>路径: {currentPath}</span>
      </div>
    </div>
  );
}

export default FileManager;
