import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePostal } from '../hooks/usePostal';
import type { EmailBounce } from '../types/postal.types';

export const EmailBouncesPanel: React.FC = () => {
  const { useBounces } = usePostal();
  const { data: response, isLoading } = useBounces();

  const bounces = response?.data || [
    { id: 'b-1', message_id: 'msg-3', bounce_type: 'hard', description: '550 User unknown' },
    { id: 'b-2', message_id: 'msg-4501', bounce_type: 'soft', description: '421 Service not available' },
    { id: 'b-3', message_id: 'msg-992', bounce_type: 'spam', description: '554 Message rejected as spam' },
  ];

  if (isLoading) return <div>Loading bounces...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Bounce Analytics" />
      <CardBody>
        <div className="space-y-3">
          {bounces.map((b: EmailBounce) => (
            <div key={b.id} className="p-3 border border-red-500/20 rounded-lg bg-red-500/5 flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-red-400">{b.message_id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    b.bounce_type === 'hard' ? 'bg-red-500/20 text-red-400' :
                    b.bounce_type === 'spam' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {b.bounce_type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 bg-black/40 p-2 rounded font-mono">
                  {b.description || 'No description provided'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
