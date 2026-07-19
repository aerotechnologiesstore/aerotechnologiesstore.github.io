"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

import Link from 'next/link';

export default function Navigation() {
  const { user, userData } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Prefer userData photo over user photo, and fallback to initials
  const profilePhoto = userData?.photoURL || user?.photoURL;
  const initial = (userData?.displayName || user?.displayName || "U")[0].toUpperCase();

  return (
    <>
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '16px 24px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Desktop & Mobile Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/logos/logo-orange.png" alt="Aero Store" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} id="nav-logo" />
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>Aero Store</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-desktop-links" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/developers/" style={{ color: '#fff', textDecoration: 'none', fontWeight: pathname?.includes('/developers') ? 700 : 500, opacity: pathname?.includes('/developers') ? 1 : 0.7 }}>For Developers</Link>
          
          {user ? (
            <>
              {userData?.role === 'admin' && (
                <Link href="/admin/" style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,77,77,0.2)', border: '1px solid rgba(255,77,77,0.5)', color: '#ff4d4d', textDecoration: 'none', fontWeight: 600 }}>
                  Admin Panel
                </Link>
              )}
              {(userData?.role === 'developer' || userData?.role === 'admin') && (
                <Link href="/dashboard/" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                  Dashboard
                </Link>
              )}
              <Link href="/profile/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--c2)' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c1), var(--c2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {initial}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <Link href="/login/" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, var(--c1), var(--c2))', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
              Log in
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(true)}
          style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '26px', cursor: 'pointer', padding: '4px' }}
        >
          ☰
        </button>
      </nav>

      {/* Premium Full-Screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="store-mobile-menu" onClick={() => setMobileMenuOpen(false)}>
          <div className="store-mobile-menu-inner" onClick={(e) => e.stopPropagation()}>
            
            {/* Mobile Menu Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logos/logo-orange.png" alt="Aero Store" style={{ width: '36px', height: '36px', borderRadius: '10px' }} id="mobile-nav-logo" />
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Aero Store</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '18px',
                cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>

            {/* Mobile Menu Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/developers/" onClick={() => setMobileMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                borderRadius: '14px', textDecoration: 'none', color: '#fff',
                background: pathname?.includes('/developers') ? 'linear-gradient(135deg, var(--c1), var(--c2))' : 'rgba(255,255,255,0.04)',
                fontWeight: pathname?.includes('/developers') ? 700 : 500, fontSize: '17px',
                border: pathname?.includes('/developers') ? 'none' : '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{ fontSize: '22px' }}>💻</span> For Developers
              </Link>

              {user ? (
                <>
                  <Link href="/profile/" onClick={() => setMobileMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                    borderRadius: '14px', textDecoration: 'none', color: '#fff',
                    background: pathname?.includes('/profile') ? 'linear-gradient(135deg, var(--c1), var(--c2))' : 'rgba(255,255,255,0.04)',
                    fontWeight: pathname?.includes('/profile') ? 700 : 500, fontSize: '17px',
                    border: pathname?.includes('/profile') ? 'none' : '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '22px' }}>👤</span>
                    )}
                    My Profile
                  </Link>

                  {(userData?.role === 'developer' || userData?.role === 'admin') && (
                    <Link href="/dashboard/" onClick={() => setMobileMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                      borderRadius: '14px', textDecoration: 'none', color: '#fff',
                      background: 'rgba(255,255,255,0.04)', fontWeight: 500, fontSize: '17px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <span style={{ fontSize: '22px' }}>🚀</span> Developer Dashboard
                    </Link>
                  )}

                  {userData?.role === 'admin' && (
                    <Link href="/admin/" onClick={() => setMobileMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                      borderRadius: '14px', textDecoration: 'none', color: '#ff4d4d',
                      background: 'rgba(255,77,77,0.1)', fontWeight: 700, fontSize: '17px',
                      border: '1px solid rgba(255,77,77,0.3)'
                    }}>
                      <span style={{ fontSize: '22px' }}>🛡️</span> Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/login/" onClick={() => setMobileMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                  borderRadius: '14px', textDecoration: 'none', color: '#fff',
                  background: 'linear-gradient(135deg, var(--c1), var(--c2))',
                  fontWeight: 700, fontSize: '17px', textAlign: 'center', justifyContent: 'center'
                }}>
                  Log in
                </Link>
              )}
            </div>
            
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }

        /* Full-screen mobile menu */
        .store-mobile-menu {
          position: fixed;
          inset: 0;
          z-index: 500;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(12px);
          animation: fadeIn 0.2s ease;
        }

        .store-mobile-menu-inner {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 85%;
          max-width: 320px;
          background: var(--bg);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border);
          animation: slideInRight 0.25s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
