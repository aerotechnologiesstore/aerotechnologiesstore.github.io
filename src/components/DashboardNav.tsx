"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

import Link from 'next/link';

export default function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: 'Overview', path: '/dashboard/', icon: '📊' },
    { name: 'Upload App', path: '/dashboard/upload/', icon: '🚀' },
    { name: 'My Apps', path: '/dashboard/apps/', icon: '📱' },
    { name: 'Verification', path: '/dashboard/verification/', icon: '🛡️' },
    { name: 'Settings', path: '/dashboard/settings/', icon: '⚙️' },
  ];

  const normalizedPathname = pathname.endsWith('/') ? pathname : pathname + '/';

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="dash-sidebar">
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--c1), var(--c2))', borderRadius: '8px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>Aero Dev</span>
          </Link>
        </div>

        <div role="navigation" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px', flex: 1 }}>
          {links.map(link => {
            const fullPath = `${link.path}`;
            const isActive = normalizedPathname.endsWith(fullPath);
            return (
              <Link key={link.path} href={fullPath} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'var(--surface2)' : 'transparent',
                border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 400, fontSize: '15px', transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '18px', opacity: isActive ? 1 : 0.5 }}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <Link href="/profile/" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Back to Profile</Link>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="dash-mobile-bar">
        <button onClick={() => setMobileOpen(true)} style={{
          background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', padding: '4px'
        }}>☰</button>
        <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.5px' }}>Aero Dev</span>
        <Link href="/profile/" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c1), var(--c2))', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#fff', fontSize: '14px', fontWeight: 700 }}>
          P
        </Link>
      </div>

      {/* ===== MOBILE FULLSCREEN MENU ===== */}
      {mobileOpen && (
        <div className="dash-mobile-menu" onClick={() => setMobileOpen(false)}>
          <div className="dash-mobile-menu-inner" onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--c1), var(--c2))', borderRadius: '10px' }} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Aero Dev</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '18px',
                cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>

            <div role="navigation" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {links.map(link => {
                const fullPath = `${link.path}`;
                const isActive = normalizedPathname.endsWith(fullPath);
                return (
                  <Link key={link.path} href={fullPath} onClick={() => setMobileOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '12px', textDecoration: 'none',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                    background: isActive ? 'linear-gradient(135deg, var(--c1), var(--c2))' : 'transparent',
                    fontWeight: isActive ? 700 : 500, fontSize: '16px', transition: 'all 0.2s',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ fontSize: '20px' }}>{link.icon}</span>
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Link href="/" onClick={() => setMobileOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '12px', textDecoration: 'none', color: 'rgba(255,255,255,0.5)',
                fontSize: '15px', background: 'rgba(255,255,255,0.03)'
              }}>
                🏠 Back to Aero Store
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Desktop sidebar */
        .dash-sidebar {
          width: 260px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          height: 100vh;
          padding: 24px 0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
        }

        /* Mobile top bar - hidden on desktop */
        .dash-mobile-bar {
          display: none;
        }

        @media (max-width: 768px) {
          /* Hide desktop sidebar on mobile */
          .dash-sidebar {
            display: none !important;
          }

          /* Show mobile top bar */
          .dash-mobile-bar {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 200;
            height: 56px;
            padding: 0 16px;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
          }

          /* Full-screen mobile menu */
          .dash-mobile-menu {
            position: fixed;
            inset: 0;
            z-index: 500;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            animation: fadeIn 0.2s ease;
          }

          .dash-mobile-menu-inner {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 85%;
            max-width: 320px;
            background: var(--bg);
            padding: 32px 24px;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--border);
            animation: slideIn 0.25s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        }
      `}</style>
    </>
  );
}
