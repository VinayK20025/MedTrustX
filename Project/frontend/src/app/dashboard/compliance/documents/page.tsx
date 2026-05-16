'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useComplianceDashboard } from '@/modules/compliance/hooks/useComplianceAnalytics';
import { FileText, Download, Eye, Calendar, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function DocumentsPage() {
  const { data } = useComplianceDashboard({});
  const documents = data?.data?.documents ?? [];
  const active = documents.filter(d => d.status === 'Active').length;
  const archived = documents.filter(d => d.status === 'Archived').length;
  const totalDownloads = documents.reduce((sum, d) => sum + (d.downloadCount ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Compliance' }, { label: 'Documents & Resources' }]} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Active Documents" subtitle="Current and valid" icon={<FileText className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{active}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Total Downloads" subtitle="Document access count" icon={<Download className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-sky-400">{totalDownloads.toLocaleString()}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Archived" subtitle="Legacy/deprecated docs" icon={<Calendar className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-gray-400">{archived}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Total Documents" subtitle="Library size" icon={<FileText className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{documents.length}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Compliance Documents Library" subtitle="Policies, procedures, forms, and standards" icon={<FileText className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {documents.map(doc => {
            const daysUntilExpiry = doc.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            return (
              <div key={doc.id} className={cn('rounded-xl border p-4 space-y-3', doc.status === 'Active' ? 'border-white/[0.06] bg-black/20' : doc.status === 'Expired' ? 'border-emergency/30 bg-emergency/[0.05]' : 'border-white/10 bg-white/[0.02]')}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">v{doc.version} • {doc.department}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0',
                    doc.status === 'Active' ? 'text-success-light bg-success/10' : doc.status === 'Expired' ? 'text-emergency-light bg-emergency/10 animate-pulse' : 'text-gray-400 bg-white/10'
                  )}>{doc.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Type</span><span className="text-gray-200 capitalize">{doc.type}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Category</span><span className="text-gray-200">{doc.category}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Owner</span><span className="text-gray-200">{doc.owner}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Modified</span><span className="text-gray-200">{new Date(doc.lastModified).toLocaleDateString()}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Size</span><span className="text-gray-200">{doc.fileSize}</span></div>
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    <span>{doc.downloadCount?.toLocaleString()} downloads</span>
                  </div>
                  {daysUntilExpiry !== null && (
                    <span className={cn('font-semibold', daysUntilExpiry < 30 ? 'text-warning-light' : daysUntilExpiry < 0 ? 'text-emergency-light' : 'text-gray-300')}>
                      {daysUntilExpiry > 0 ? `Exp: ${daysUntilExpiry}d` : 'Expired'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
