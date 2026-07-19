"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { subscribeToActiveAnnouncements, Announcement } from '@/lib/db';




export default function DevelopersPage() {
  const { user, userData } = useAuth();
  const logoSrc = '/logos/logo-blue-v2.png';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const unsub = subscribeToActiveAnnouncements((anns) => {
      // Developers see announcements meant for everyone or specifically developers
      setAnnouncements(anns.filter(a => a.targetAudience !== 'user'));
    });
    return () => unsub();
  }, []);

  

  

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

        {announcements.length > 0 && (
          <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto 40px', position: 'relative', zIndex: 10, textAlign: 'left' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', textAlign: 'center' }}>Platform Announcements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {announcements.map(ann => (
                <div key={ann.id} style={{ 
                  padding: '24px', background: 'var(--surface2)', border: '1px solid var(--border)', 
                  borderRadius: '16px', borderLeft: `4px solid ${ann.type === 'success' ? '#4ade80' : ann.type === 'warning' ? '#fbbf24' : '#60a5fa'}` 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: ann.type === 'success' ? '#4ade80' : ann.type === 'warning' ? '#fbbf24' : '#60a5fa' }}>
                      {ann.type === 'info' ? 'System Update' : ann.type === 'success' ? 'Good News' : 'Important Notice'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {ann.createdAt ? new Date(ann.createdAt.toMillis ? ann.createdAt.toMillis() : ann.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', color: 'var(--text-main)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {ann.message.split(/(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/g).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
                      if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
          <p style={{fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto'}}>We built Aero Store because developers deserve a fair, transparent, and secure marketplace without gatekeeping.</p>
        </div>

        <div className="bento-grid">
          {/* Bento Item 1 - Large */}
          <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '60px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{flex: '1 1 400px'}}>
              <div style={{width: '60px', height: '60px', borderRadius: '16px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '24px', border: '1px solid var(--border)'}}>🛡️</div>
              <h3 style={{fontSize: '32px', fontWeight: 800, marginBottom: '16px'}}>Verified Developers Only</h3>
              <p style={{fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6}}>Every developer on our platform goes through mandatory identity and address verification. No anonymous uploads, no shady accounts. Every app is traceable to a real person or company.</p>
            </div>
            <div style={{flex: '1 1 300px', display: 'flex', justifyContent: 'center'}}>
               <div style={{background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px'}}>
                 <div style={{width: '48px', height: '48px', borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '24px'}}>✓</div>
                 <div>
                   <div style={{fontWeight: 700, fontSize: '18px'}}>Identity Verified</div>
                   <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Aero Store Trust & Safety</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Bento Item 2 */}
          <div className="glass-panel" style={{padding: '40px'}}>
            <div style={{width: '50px', height: '50px', borderRadius: '12px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid var(--border)'}}>🔍</div>
            <h3 style={{fontSize: '24px', fontWeight: 700, marginBottom: '12px'}}>Automated Scanning</h3>
            <p style={{fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6}}>Every uploaded APK passes through multi-layer security scans. Malicious or suspicious code is flagged and blocked instantly.</p>
          </div>

          {/* Bento Item 3 */}
          <div className="glass-panel" style={{padding: '40px'}}>
            <div style={{width: '50px', height: '50px', borderRadius: '12px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid var(--border)'}}>⚖️</div>
            <h3 style={{fontSize: '24px', fontWeight: 700, marginBottom: '12px'}}>Fair Disputes</h3>
            <p style={{fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6}}>Every complaint is tracked transparently with timestamped audit trails — no black-box decisions or automated takedowns without review.</p>
          </div>

          {/* Bento Item 4 */}
          <div className="glass-panel" style={{padding: '40px'}}>
            <div style={{width: '50px', height: '50px', borderRadius: '12px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid var(--border)'}}>🤖</div>
            <h3 style={{fontSize: '24px', fontWeight: 700, marginBottom: '12px'}}>AI-Powered Moderation</h3>
            <p style={{fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6}}>Powered by Google Gemini — our AI reviews app descriptions, scans metadata, and auto-flags policy violations before human review.</p>
          </div>
          
          {/* Bento Item 5 */}
          <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '60px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{flex: '1 1 400px'}}>
              <h3 style={{fontSize: '32px', fontWeight: 800, marginBottom: '16px'}}>Ship Your App to <span className="grad-text">Thousands.</span></h3>
              <p style={{fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px'}}>Aero Store is open for developer registrations. Track downloads, ratings, user feedback, and geographic distribution from one clean dashboard. Free to publish, forever.</p>
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
