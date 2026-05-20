import type { InferredModule } from './types'
import type { BlockTask } from '../hooks/useBlockTasks'

/** Map inferred module names to the actual marketplace component names */
const MODULE_MAP: Record<string, string> = {
  QuotePanel: 'QuotePanel',
  DataTable: 'DataTable',
  Dashboard: 'Dashboard',
  FileManager: 'FileManager',
  Notification: 'Notification',
}

/** Convert inference results into BlockTask[] for the task board */
export function inferenceToTasks(
  modules: InferredModule[],
  _templateName: string,
  purpose = '',
): BlockTask[] {
  const moduleMap = new Map<string, BlockTask>()

  for (const m of modules) {
    const mappedName = MODULE_MAP[m.module] || m.module
    if (moduleMap.has(mappedName)) continue

    // Map dependency labels to actual module names
    const mappedDeps = m.dependsOn.map((dep) => MODULE_MAP[dep] || dep).filter((d) => d !== mappedName)

    moduleMap.set(mappedName, {
      id: `task-${mappedName.toLowerCase()}`,
      moduleName: mappedName,
      label: purpose ? `${m.label}（${purpose}）` : m.label,
      proposer: purpose ? `目的驱动: ${purpose}` : 'AI-Inferred',
      status: 'pending',
      progress: 0,
      reward: 0,
      hash: '',
      dependsOn: mappedDeps.map((d) => `task-${d.toLowerCase()}`),
    })
  }

  return [...moduleMap.values()]
}
