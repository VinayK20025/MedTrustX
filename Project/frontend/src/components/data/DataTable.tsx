'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner, Skeleton } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: (row: T) => string;
  stickyHeader?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns, data, loading, emptyMessage = 'No data found', onSort, sortField, sortDirection,
  page = 1, pageSize = 20, total = 0, onPageChange, onPageSizeChange,
  onRowClick, rowKey, stickyHeader = true, className,
}: DataTableProps<T>) {
  const [localSort, setLocalSort] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(null);
  const activeSort = sortField ?? localSort?.field;
  const activeDir = sortDirection ?? localSort?.dir ?? 'asc';

  const handleSort = useCallback((field: string) => {
    const newDir = activeSort === field && activeDir === 'asc' ? 'desc' : 'asc';
    if (onSort) { onSort(field, newDir); } else { setLocalSort({ field, dir: newDir }); }
  }, [activeSort, activeDir, onSort]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const getCellValue = useCallback((row: T, col: Column<T>, idx: number): React.ReactNode => {
    if (col.render) {
      const raw = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : (row as Record<string, unknown>)[col.accessor as string]) : undefined;
      return col.render(raw, row, idx);
    }
    if (col.accessor) {
      return typeof col.accessor === 'function' ? col.accessor(row) : String((row as Record<string, unknown>)[col.accessor as string] ?? '');
    }
    return String((row as Record<string, unknown>)[col.key] ?? '');
  }, []);

  const sortedData = useMemo(() => {
    if (!localSort || onSort) return data;
    return [...data].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[localSort.field] ?? '');
      const bv = String((b as Record<string, unknown>)[localSort.field] ?? '');
      return localSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [data, localSort, onSort]);

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="bg-surface-dark/90 backdrop-blur-sm border-b border-white/[0.06]">
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }} className={cn('px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left', col.sortable && 'cursor-pointer select-none hover:text-white transition-colors', col.className)}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}>
                  <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end', col.align === 'center' && 'justify-center')}>
                    {col.header}
                    {col.sortable && (activeSort === col.key ? (activeDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-30" />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={columns.length} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">{emptyMessage}</td></tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={rowKey ? rowKey(row) : idx} onClick={() => onRowClick?.(row, idx)}
                  className={cn('transition-colors hover:bg-white/[0.03]', onRowClick && 'cursor-pointer')}>
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-gray-300', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left', col.className)}>
                      {getCellValue(row, col, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Rows per page:</span>
            <select value={pageSize} onChange={(e) => onPageSizeChange?.(Number(e.target.value))} className="bg-transparent border border-white/10 rounded px-2 py-1 text-gray-300 text-xs">
              {[10, 20, 50, 100].map((s) => <option key={s} value={s} className="bg-surface-dark">{s}</option>)}
            </select>
            <span className="ml-2">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-xs text-gray-400 px-2">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="xs" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
