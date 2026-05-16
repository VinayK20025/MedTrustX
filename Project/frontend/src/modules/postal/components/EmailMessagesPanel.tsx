import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePostal } from '../hooks/usePostal';
import type { EmailMessage } from '../types/postal.types';

export const EmailMessagesPanel: React.FC = () => {
  const { useMessages } = usePostal();
  const { data: response, isLoading } = useMessages();

  const messages = response?.data || [
    { id: 'msg-1', to_address: 'dr.smith@medtrustx.com', subject: 'Lab Results Ready: PT-9902', body: 'The results for PT-9902 are now available...', status: 'sent' },
    { id: 'msg-2', to_address: 'jane.doe@example.com', subject: 'Appointment Reminder', body: 'Reminder: Your appointment is tomorrow at 9 AM...', status: 'pending' },
    { id: 'msg-3', to_address: 'invalid-email@bounce.com', subject: 'Billing Statement', body: 'Your current statement is attached...', status: 'bounced' },
  ];

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Outbound Email Registry" />
      <CardBody>
        <div className="space-y-3">
          {messages.map((msg: EmailMessage) => (
            <div key={msg.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="font-semibold text-sm text-gray-200">{msg.to_address}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  msg.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                  msg.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {msg.status}
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-300">{msg.subject}</h4>
              <p className="text-xs text-gray-500 line-clamp-1">{msg.body}</p>
              <div className="text-[10px] text-gray-600 font-mono self-end">ID: {msg.id.split('-')[1]}</div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
