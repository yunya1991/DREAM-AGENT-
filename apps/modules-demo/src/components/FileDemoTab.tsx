import { FileManager } from '../marketplace'
import { mockFileTree } from '../data/file-tree'

export function FileDemoTab() {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        文件管理 — 浏览项目目录结构
      </h2>
      <FileManager
        files={mockFileTree}
        rootName="DREAM-AG协作协议"
        onFileSelect={(file) => console.log('Selected:', file.path)}
      />
    </div>
  )
}
