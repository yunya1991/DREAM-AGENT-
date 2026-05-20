import React, { useState, useCallback, useMemo } from 'react';
import {
  Sun,
  Moon,
  Plus,
  X,
  GripVertical,
  LayoutDashboard,
} from 'lucide-react';
import type { WidgetConfig, DashboardProps } from './types';

// ─── Theme Hook ───────────────────────────────────────────────
function useTheme(initial: 'light' | 'dark' | 'auto' = 'auto') {
  const [mode, setMode] = useState<'light' | 'dark' | 'auto'>(initial);

  const theme = useMemo(() => {
    if (mode !== 'auto') return mode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, mode, toggle, setMode };
}

// ─── Tab Bar ──────────────────────────────────────────────────
interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddTab: () => void;
  onRemoveTab: (tab: string) => void;
}

function TabBar({
  tabs,
  activeTab,
  onTabChange,
  onAddTab,
  onRemoveTab,
}: TabBarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 px-4 pt-2">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`group flex items-center gap-1 px-3 py-2 text-sm rounded-t-md transition-colors cursor-pointer
            ${tab === activeTab
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          onClick={() => onTabChange(tab)}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="select-none">{tab}</span>
          {tabs.length > 1 && (
            <button
              className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTab(tab);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={onAddTab}
        title="新增标签页"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Widget Card ──────────────────────────────────────────────
interface WidgetCardProps {
  widget: WidgetConfig;
  children?: React.ReactNode;
  onMove?: (id: string, pos: { x: number; y: number }) => void;
}

function WidgetCard({ widget, children }: WidgetCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {widget.title}
          </h3>
          {widget.badge && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              {widget.badge}
            </span>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────
function WidgetSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

// ─── Dashboard (Main Component) ───────────────────────────────
export function Dashboard({
  widgets,
  dataProvider,
  theme: initialTheme = 'auto',
  loading = false,
}: DashboardProps) {
  const { theme, toggle } = useTheme(initialTheme);
  const [tabs, setTabs] = useState(['默认']);
  const [activeTab, setActiveTab] = useState('默认');

  // Filter widgets for active tab (simple grouping by position.y === 0)
  const activeWidgets = useMemo(() => {
    return widgets;
  }, [widgets]);

  const handleAddTab = useCallback(() => {
    const newTab = `标签页 ${tabs.length + 1}`;
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab);
  }, [tabs.length]);

  const handleRemoveTab = useCallback(
    (tab: string) => {
      setTabs((prev) => prev.filter((t) => t !== tab));
      if (activeTab === tab) {
        setActiveTab(tabs[0]);
      }
    },
    [tabs, activeTab],
  );

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-2">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Dashboard
            </h1>
            <div className="flex items-center gap-2">
              {loading && (
                <span className="text-xs text-gray-500">加载中...</span>
              )}
              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="切换主题"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {/* Tab Bar */}
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddTab={handleAddTab}
            onRemoveTab={handleRemoveTab}
          />
        </header>

        {/* Main Content */}
        <main className="p-4 max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <WidgetSkeleton />
              <WidgetSkeleton />
              <WidgetSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWidgets.map((widget) => (
                <WidgetCard key={widget.id} widget={widget}>
                  {widget.content || (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {widget.description || '暂无内容'}
                    </div>
                  )}
                </WidgetCard>
              ))}
            </div>
          )}

          {activeWidgets.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <LayoutDashboard className="w-12 h-12 mb-4" />
              <p className="text-lg">暂无 Widget</p>
              <p className="text-sm mt-1">点击左上角 + 新增</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
