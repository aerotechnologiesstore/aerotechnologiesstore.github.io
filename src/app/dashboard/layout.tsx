"use client";
import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import DashboardNav from '@/components/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireRole="developer">
      <div className="flex flex-col md:flex-row min-h-screen bg-surface text-on-surface">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
