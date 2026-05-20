import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
export interface Column<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  exportable?: boolean;
  className?: string;
  onRowClick?: (row: T) => void;
}

// ─── DataTable (Main Component) ───────────────────────────────
export function DataTable<T = any>({
  columns,
  data,
  pageSize = 20,
  searchable = true,
  exportable = true,
  className = '',
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row as Record<string, any>).some(
        (val) => String(val).toLowerCase().includes(term),
      ),
    );
  }, [data, searchTerm]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortable) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filteredData, sortKey, sortDir, columns]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pageData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when data changes
  const onSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(0);
  }, []);

  const onSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  const toggleRow = useCallback((idx: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === pageData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(
        new Set(pageData.map((_, i) => page * pageSize + i)),
      );
    }
  }, [pageData, page, pageSize, selectedRows.size]);

  const exportCSV = useCallback(() => {
    const header = columns.map((c) => c.header).join(',');
    const rows = sortedData.map((row: any) =>
      columns.map((c) => `"${row[c.key] ?? ''}"`).join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, sortedData]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sortedData.length} / {data.length} 行
          </span>
        </div>
        {exportable && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            导出 CSV
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <th className="w-10 px-3 py-2.5 text-center">
                <button onClick={toggleAll} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                  {selectedRows.size === pageData.length && pageData.length > 0 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded" />
                  )}
                </button>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 font-medium text-gray-600 dark:text-gray-400 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row: any, i) => {
              const globalIdx = page * pageSize + i;
              const isSelected = selectedRows.has(globalIdx);
              return (
                <tr
                  key={globalIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-100 dark:border-gray-700/50 transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  <td className="px-3 py-2.5 text-center">
                    <div
                      className={`w-4 h-4 mx-auto rounded border flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(globalIdx);
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2.5 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                      }`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            第 {page + 1} / {totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
