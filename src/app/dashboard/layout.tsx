"use client";
import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import DashboardNav from '@/components/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireRole="developer">
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <DashboardNav />
        <main className="dash-main" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .dash-main {
            padding: 16px !important;
            padding-top: 72px !important;
          }
        }
      `}</style>
    </AuthGuard>
  );
}
