
interface TabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-gray-800">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            tab === activeTab
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
