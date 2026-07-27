"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: 'Overview', path: '/dashboard', icon: 'bar_chart' },
    { name: 'Upload App', path: '/dashboard/upload', icon: 'rocket_launch' },
    { name: 'My Apps', path: '/dashboard/apps', icon: 'apps' },
    { name: 'Verification', path: '/dashboard/verification', icon: 'verified_user' },
    { name: 'Settings', path: '/dashboard/settings', icon: 'settings' },
  ];

  const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-64 bg-surface-container-low border-r border-outline-variant h-screen flex-col sticky top-0 py-6">
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>developer_mode</span>
            </div>
            <span className="font-display-lg text-lg font-bold text-on-surface">Aero Dev</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-2 px-4 flex-1">
          {links.map(link => {
            const isActive = normalizedPathname === link.path || (link.path === '/dashboard' && normalizedPathname === '/dashboard');
            return (
              <Link key={link.path} href={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg transition-all ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}>
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 pt-4 border-t border-outline-variant">
          <Link href="/profile" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-label-lg">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Profile
          </Link>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 h-16 px-4 bg-surface-container-low/90 backdrop-blur-md border-b border-outline-variant z-40">
        <button onClick={() => setMobileOpen(true)} className="text-on-surface p-2 rounded-full hover:bg-surface-variant">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-display-lg text-lg font-bold">Aero Dev</span>
        <Link href="/profile" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
          P
        </Link>
      </div>

      {/* ===== MOBILE FULLSCREEN MENU ===== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-xs bg-surface-container-low border-r border-outline-variant p-6 flex flex-col animate-slide-in-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>developer_mode</span>
                </div>
                <span className="font-display-lg text-lg font-bold text-on-surface">Aero Dev</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-variant text-on-surface hover:bg-surface-container-highest">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {links.map(link => {
                const isActive = normalizedPathname === link.path;
                return (
                  <Link key={link.path} href={link.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg transition-all ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-outline-variant">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-variant text-on-surface-variant font-label-lg">
                <span className="material-symbols-outlined">home</span>
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
