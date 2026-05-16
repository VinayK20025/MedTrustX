'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { useAutoApi } from '@/hooks/useAutoApi';

export interface GenericDataTableProps {
  endpointKey: string;
  title: string;
  description?: string;
}

export function GenericDataTable({ endpointKey, title, description }: GenericDataTableProps) {
  const api = useAutoApi() as any;
  const targetApi = api[endpointKey];
  
  if (!targetApi) {
    return <div className="p-4 text-red-500">Invalid API endpoint key: {endpointKey}</div>;
  }

  const { data, isLoading, refetch: fetchList } = targetApi.useList();
  const { mutate: createItem } = targetApi.useCreate();
  const { mutate: updateItem } = targetApi.useUpdate();
  const { mutate: deleteItem } = targetApi.useDelete();
  
  const [search, setSearch] = useState('');

  const items = Array.isArray(data) ? data : (data as any)?.items || [];
  const filteredItems = items.filter((item: any) => 
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const columns = items.length > 0 ? Object.keys(items[0]).filter(k => k !== 'id' && !k.startsWith('_')).slice(0, 6) : [];

  return (
    <Card className="border-white/[0.06] bg-surface-dark w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-lg font-bold text-white capitalize">{title}</h2>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input 
              className="pl-9 h-9 w-full bg-black/20 text-sm" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchList()} disabled={isLoading} className="h-9">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 h-9">
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
      </div>
      
      <CardBody className="p-0">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading && items.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <Spinner size="md" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-2">
              <div className="p-3 bg-white/5 rounded-full"><Search className="w-6 h-6 text-gray-400" /></div>
              <p>No records found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-y border-white/[0.04]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  {columns.map(col => (
                    <th key={col} className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {col.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredItems.map((item: any, i: number) => (
                  <tr key={item.id || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{(item.id || String(i)).slice(0, 8)}</td>
                    {columns.map(col => (
                      <td key={col} className="px-6 py-4 text-gray-300 max-w-[200px] truncate">
                        {typeof item[col] === 'object' ? JSON.stringify(item[col]) : String(item[col] || '-')}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-400">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-rose-400" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
