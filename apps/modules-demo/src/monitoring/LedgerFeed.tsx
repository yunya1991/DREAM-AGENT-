import { DataTable } from '../marketplace'
import { ledgerColumns, mockLedger } from './data/ledger'

export function LedgerFeed() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          账本记录 ({mockLedger.length} 条)
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>已归档: {mockLedger.filter((e) => e.status === 'archived').length}</span>
          <span>进行中: {mockLedger.filter((e) => e.status === 'in-progress').length}</span>
          <span>验证中: {mockLedger.filter((e) => e.status === 'validating').length}</span>
        </div>
      </div>
      <DataTable columns={ledgerColumns} data={mockLedger} pageSize={10} searchable exportable />
    </div>
  )
}
