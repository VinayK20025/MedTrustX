'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Save, History, Search } from 'lucide-react';
import { useSaveClinicalNote } from '../hooks/useClinicalRecords';
import type { ClinicalNote } from '../types/clinical.types';

interface Props {
  roleTitle?: string;
  defaultNoteType?: ClinicalNote['type'];
}

export function ClinicalRecordsWorkspace({ roleTitle = 'Clinical Documentation', defaultNoteType = 'soap' }: Props) {
  const { mutate: saveNote, isPending } = useSaveClinicalNote();
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;
    saveNote({
      type: defaultNoteType,
      content: { freeText: content },
      status: 'draft',
      timestamp: new Date().toISOString(),
    });
    setContent('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col min-h-[500px]">
          <CardHeader title={`${roleTitle} Workspace`} icon={<FileText className="w-5 h-5" />} action={
            <Button onClick={handleSave} isLoading={isPending} leftIcon={<Save className="w-4 h-4" />} size="sm">
              Save Note
            </Button>
          } />
          <CardBody className="flex-1 flex flex-col">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full bg-surface-dark border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
              placeholder="Start typing clinical note..."
            />
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="flex-1">
          <CardHeader title="Patient History" icon={<History className="w-5 h-5" />} />
          <CardBody>
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="text-sm text-gray-500 text-center py-10 border border-dashed border-white/10 rounded-lg">
              No recent history selected. Select a patient to view their timeline.
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
