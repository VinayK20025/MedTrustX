'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { StudentDiscussion } from '../types/student.types';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { discussions: StudentDiscussion[]; }

export function StudentDiscussionPanel({ discussions }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Case Discussions</h3>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[10px]">New Question</Button>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {discussions.map(d => (
          <div key={d.id} className="p-3 rounded-lg border border-white/[0.04] bg-surface-dark cursor-pointer hover:bg-white/[0.02] transition-colors relative">
            {d.unreadCount > 0 && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />}
            <div className="mb-2 pr-4">
              <span className="text-xs font-bold text-gray-200 block">{d.topic}</span>
            </div>
            <div className="flex justify-between items-end text-[10px]">
              <span className="text-gray-500">{d.caseId ? `Ref: ${d.caseId}` : 'General'}</span>
              <span className="text-indigo-300">Last reply: {d.lastReplyBy}</span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
