'use client';
import React, { useEffect } from 'react';
import { eventService } from '@/services/events.service';
import { useAuthStore } from '@/store/auth.store';

export function EventProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const tenantId = useAuthStore((s) => s.tenant?.id);

  useEffect(() => {
    if (token && tenantId) {
      eventService.connect(token, tenantId);
    }
    return () => { eventService.disconnect(); };
  }, [token, tenantId]);

  return <>{children}</>;
}
