"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

/* ─── THEME DEFINITIONS ─── */
const THEMES = [
  { name: 'Inferno', bg: '#080400', bg2: '#100800', surface: '#1a0c00', surface2: '#221000', c1: '#FF2D00', c2: '#FF6B00', c3: '#FFB300', border: 'rgba(255,107,0,0.15)', glow: 'rgba(255,107,0,0.2)', logo: '/logos/logo-orange-v2.png' },
  { name: 'Cyber', bg: '#000810', bg2: '#001020', surface: '#001428', surface2: '#001a33', c1: '#00A3FF', c2: '#00D4FF', c3: '#7DF9FF', border: 'rgba(0,163,255,0.15)', glow: 'rgba(0,163,255,0.2)', logo: '/logos/logo-blue-v2.png' },
  { name: 'Nebula', bg: '#0a0018', bg2: '#120020', surface: '#1a0830', surface2: '#220e3a', c1: '#8B5CF6', c2: '#A78BFA', c3: '#DDD6FE', border: 'rgba(139,92,246,0.15)', glow: 'rgba(139,92,246,0.2)', logo: '/logos/logo-purple-v2.png' },
  { name: 'Launch', bg: '#100400', bg2: '#180800', surface: '#201000', surface2: '#2a1400', c1: '#FF4500', c2: '#FF8C00', c3: '#FFD700', border: 'rgba(255,140,0,0.15)', glow: 'rgba(255,140,0,0.2)', logo: '/logos/logo-rocket-v2.png' },
];

function applyTheme(theme: typeof THEMES[0]) {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--bg2', theme.bg2);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface2', theme.surface2);
  root.style.setProperty('--c1', theme.c1);
  root.style.setProperty('--c2', theme.c2);
  root.style.setProperty('--c3', theme.c3);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--glow', theme.glow);
}

export default function DevelopersPage() {
  const { user, userData } = useAuth();
  const [logoSrc, setLogoSrc] = useState(THEMES[0].logo);

  const cycleTheme = useCallback(() => {
    setLogoSrc((prev) => {
      const currentIdx = THEMES.findIndex(t => t.logo === prev);
      const next = (currentIdx + 1) % THEMES.length;
      applyTheme(THEMES[next]);
      return THEMES[next].logo;
    });
  }, []);

  useEffect(() => {
    applyTheme(THEMES[0]);
    const interval = setInterval(cycleTheme, 8000);
    return () => clearInterval(interval);
  }, [cycleTheme]);

  const preventContext = (e: React.MouseEvent) => e.preventDefault();

  return (
    <>
      <Navigation />

      {/* HERO */}
      <section className="glass-hero" onContextMenu={preventContext} style={{ paddingTop: '120px' }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="neon-glow" style={{width: '600px', height: '600px', background: 'var(--c1)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
        
        <div className="glass-panel" style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 24px', borderRadius: '100px', marginBottom: '40px'}}>
          <div className="badge-dot" />
          <span style={{fontWeight: 600, letterSpacing: '2px', fontSize: '12px', color: 'var(--c3)'}}>INDIA&apos;S PREMIUM DEVELOPER PLATFORM</span>
        </div>

        <h1 className="glass-hero-title">
          Build. Distribute.<br/>
          <span className="grad-text">Get Discovered.</span>
        </h1>
        
        <p className="glass-hero-sub">
          Aero Store is India&apos;s independent app marketplace — where verified developers publish secure apps, and users discover software they can trust. Zero bloatware. Clean installs only.
        </p>
        
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2}}>
          {user && (userData?.role === 'developer' || userData?.role === 'admin') ? (
            <a href="/dashboard/" className="btn-glass btn-glass-primary">Go to Dashboard ➔</a>
          ) : (
            <a href="/register/developer/" className="btn-glass btn-glass-primary">Join the Developer Program ➔</a>
          )}
          <a href="/" className="btn-glass">Explore the Store</a>
        </div>
      </section>

      {/* FEATURES - BENTO GRID */}
      <section style={{padding: '100px 24px', position: 'relative'}} id="platform" onContextMenu={preventContext}>
        <div className="neon-glow" style={{width: '400px', height: '400px', background: 'var(--c2)', top: '20%', right: '0%'}} />
        <div className="neon-glow" style={{width: '500px', height: '500px', background: 'var(--c3)', bottom: '0%', left: '-10%'}} />
        
        <div style={{textAlign: 'center', marginBottom: '80px', position: 'relative', zIndex: 2}}>
          <h2 style={{fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: '16px'}}>Engineered for <span className="grad-text">Trust.</span></h2>
          <p style={{fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto'}}>We built Aero Store because developers deserve a fair, transparent, and secure marketplace without gatekeeping.</p>
        </div>

        <div className="bento-grid">
          {/* Bento Item 1 - Large */}
          <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '60px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{flex: '1 1 400px'}}>
              <div style={{width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)'}}>🛡️</div>
              <h3 style={{fontSize: '32px', fontWeight: 800, marginBottom: '16px'}}>Verified Developers Only</h3>
              <p style={{fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6}}>Every developer on our platform goes through mandatory identity and address verification. No anonymous uploads, no shady accounts. Every app is traceable to a real person or company.</p>
            </div>
            <div style={{flex: '1 1 300px', display: 'flex', justifyContent: 'center'}}>
               <div style={{background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px'}}>
                 <div style={{width: '48px', height: '48px', borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '24px'}}>✓</div>
                 <div>
                   <div style={{fontWeight: 700, fontSize: '18px'}}>Identity Verified</div>
                   <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.5)'}}>Aero Store Trust & Safety</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Bento Item 2 */}
          <div className="glass-panel" style={{padding: '40px'}}>
            <div style={{width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)'}}>🔍</div>
            <h3 style={{fontSize: '24px', fontWeight: 700, marginBottom: '12px'}}>Automated Scanning</h3>
            <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6}}>Every uploaded APK passes through multi-layer security scans. Malicious or suspicious code is flagged and blocked instantly.</p>
          </div>

          {/* Bento Item 3 */}
          <div className="glass-panel" style={{padding: '40px'}}>
            <div style={{width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)'}}>⚖️</div>
            <h3 style={{fontSize: '24px', fontWeight: 700, marginBottom: '12px'}}>Fair Disputes</h3>
            <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6}}>Every complaint is tracked transparently with timestamped audit trails — no black-box decisions or automated takedowns without review.</p>
          </div>

          {/* Bento Item 4 */}
          <div className="glass-panel" style={{padding: '40px'}}>
            <div style={{width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)'}}>🤖</div>
            <h3 style={{fontSize: '24px', fontWeight: 700, marginBottom: '12px'}}>AI-Powered Moderation</h3>
            <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6}}>Powered by Google Gemini — our AI reviews app descriptions, scans metadata, and auto-flags policy violations before human review.</p>
          </div>
          
          {/* Bento Item 5 */}
          <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '60px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{flex: '1 1 400px'}}>
              <h3 style={{fontSize: '32px', fontWeight: 800, marginBottom: '16px'}}>Ship Your App to <span className="grad-text">Thousands.</span></h3>
              <p style={{fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '32px'}}>Aero Store is open for developer registrations. Track downloads, ratings, user feedback, and geographic distribution from one clean dashboard. Free to publish, forever.</p>
              <div style={{display: 'flex', gap: '16px'}}>
                {user && (userData?.role === 'developer' || userData?.role === 'admin') ? (
                  <a href="/dashboard/" className="btn-glass btn-glass-primary">Go to Dashboard ➔</a>
                ) : (
                  <a href="/register/developer/" className="btn-glass btn-glass-primary">Register as Developer ➔</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer onContextMenu={preventContext}>
        <div className="footer-brand">
          <img className="footer-logo" src={logoSrc} alt="Aero Store" draggable={false} />
          <div>
            <div className="footer-name">Aero Store</div>
            {userData?.role === 'developer' || userData?.role === 'manager' || userData?.role === 'admin' ? (
              <a href="mailto:aerotechnologies.dev@gmail.com?subject=[Dev%20Support]%20General%20Inquiry&body=Developer%20ID:%20%0D%0AIssue%20Description:%20" className="footer-email">
                aerotechnologies.dev@gmail.com
              </a>
            ) : (
              <a href="mailto:aerotechnologies.store@gmail.com?subject=[User%20Support]%20General%20Inquiry&body=Issue%20Description:%20" className="footer-email">
                aerotechnologies.store@gmail.com
              </a>
            )}
          </div>
        </div>
        <div className="footer-links">
          <a href="/privacy/">Privacy Policy</a>
          <a href="/terms/">Terms of Use</a>
          <a href="/support/">Support & Ticketing</a>
          <a href="/developers/">Developers</a>
        </div>
        <div className="footer-copy">© 2026 Aero Store. All rights reserved. 🇮🇳 Made in India.</div>
      </footer>
    </>
  );
}
