"use client";
import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireRole="admin">
      <div className="min-h-screen bg-surface text-on-surface flex flex-col">
        <Navigation />
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
          {children}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
