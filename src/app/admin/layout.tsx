"use client";
import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireRole="admin">
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <main style={{ flex: 1, padding: '40px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
