'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TelemetryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/lender-dashboard');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', fontFamily: 'var(--font-body)' }}>
      <p style={{ color: '#71717a' }}>Redirecting to Lender Dashboard...</p>
    </div>
  );
}
