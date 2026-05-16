'use client';
import React, { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePatients } from '../hooks/usePatients';
import { formatMRN } from '@/utils/format';
import { formatDate } from '@/utils/date';
import type { Patient, PatientStatus } from '../types/patient.types';

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  active: 'success', admitted: 'info', discharged: 'default', deceased: 'danger', inactive: 'warning',
};

const columns: Column<Patient>[] = [
  {
    key: 'fullName',
    header: 'Patient',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.fullName} src={row.avatar} size="sm" />
        <div>
          <p className="text-sm font-medium text-white">{row.fullName}</p>
          <p className="text-xs text-gray-500 font-mono">{formatMRN(row.mrn)}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'age',
    header: 'Age / Gender',
    sortable: true,
    render: (_, row) => <span className="text-sm text-gray-300">{row.age}y, {row.gender}</span>,
  },
  {
    key: 'bloodGroup',
    header: 'Blood',
    render: (_, row) => row.bloodGroup ? <span className="text-sm text-emergency-light font-medium">{row.bloodGroup}</span> : <span className="text-gray-600">—</span>,
    align: 'center',
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (_, row) => <Badge variant={statusVariant[row.status] ?? 'default'} size="sm">{row.status}</Badge>,
  },
  {
    key: 'phone',
    header: 'Contact',
    render: (_, row) => <span className="text-sm text-gray-400">{row.phone ?? '—'}</span>,
  },
  {
    key: 'createdAt',
    header: 'Registered',
    sortable: true,
    render: (_, row) => <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>,
  },
];

interface PatientListProps {
  onPatientClick?: (patient: Patient) => void;
  onCreateClick?: () => void;
}

export function PatientList({ onPatientClick, onCreateClick }: PatientListProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<string>();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = usePatients({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    sortBy: sortField,
    sortOrder: sortDir,
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Input
          placeholder="Search patients by name, MRN..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="w-4 h-4" />}
          fullWidth={false}
          className="w-full sm:w-80"
        />
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Filters</Button>
          {onCreateClick && (
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onCreateClick}>
              New Patient
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <DataTable<Patient>
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          total={data?.meta?.total ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
          sortField={sortField}
          sortDirection={sortDir}
          onRowClick={onPatientClick}
          rowKey={(p) => p.id}
          emptyMessage="No patients found"
        />
      </div>
    </div>
  );
}
