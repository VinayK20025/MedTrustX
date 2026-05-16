'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants';

/**
 * Root page — redirects to /dashboard.
 * Auth is handled by the dashboard layout's AuthGuard.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.LOGIN);
  }, [router]);

  return null;
}
