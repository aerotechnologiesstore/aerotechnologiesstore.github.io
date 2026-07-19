"use client";
import React, { useEffect, useState, useRef } from 'react';
import { subscribeToPublishedApps, subscribeToActiveAnnouncements, AppListing, Announcement } from '@/lib/db';
import Navigation from '@/components/Navigation';

export default function StorefrontPage() {
  const [apps, setApps] = useState<AppListing[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnn, setExpandedAnn] = useState<Announcement | null>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubApps = subscribeToPublishedApps((publishedApps) => {
      setApps(publishedApps);
      setLoading(false);
    });
    
    const unsubAnns = subscribeToActiveAnnouncements((anns) => {
      // Show announcements meant for all or user, hide developer only
      setAnnouncements(anns.filter(a => a.targetAudience !== 'developer'));
    });

    return () => {
      unsubApps();
      unsubAnns();
    };
  }, []);

  const filteredApps = apps.filter(a => a.appName.toLowerCase().includes(search.toLowerCase()));

  // Groups and metrics
  const topDownloads = [...apps].sort((a, b) => b.downloads - a.downloads);
  const newReleases = [...apps].sort((a, b) => b.createdAt - a.createdAt);
  
  const categories = Array.from(new Set(apps.map(a => a.category))).filter(Boolean);
  
  // Carousel logic
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselApps = topDownloads.slice(0, 3);
  
  useEffect(() => {
    if (carouselApps.length > 1) {
      const timer = setInterval(() => {
        setCarouselIdx(prev => (prev + 1) % carouselApps.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [carouselApps.length]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />
      
      {/* GLASSMORPHIC HERO SEARCH */}
      <section className="glass-hero" style={{ padding: '120px 24px 80px', minHeight: 'auto', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="neon-glow" style={{width: '600px', height: '600px', background: 'var(--c1)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
          <h1 className="glass-hero-title" style={{ fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: '32px' }}>
            The best apps.<br/>
            <span className="grad-text">Verified & Secure.</span>
          </h1>
          
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', maxWidth: '600px', margin: '0 auto 32px', padding: '8px 12px', borderRadius: '100px', background: 'var(--surface)' }}>
            <div style={{ padding: '0 16px', color: 'var(--text-muted)', fontSize: '20px' }}>🔍</div>
            <input aria-label="Search Apps" 
              type="text" 
              placeholder="What are you looking for?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                flex: 1, background: 'transparent', border: 'none', 
                color: 'var(--text-main)', fontSize: '18px', outline: 'none', padding: '12px 0'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.slice(0, 5).map(cat => (
              <button key={cat} onClick={() => setSearch(cat)} className="btn-glass" style={{ padding: '8px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {cat} <span>➔</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENT CARDS */}
      {announcements.length > 0 && !search && (
        <div style={{ maxWidth: '1000px', margin: '-40px auto 40px', position: 'relative', zIndex: 10 }}>
          {announcements.length > 1 && (
            <div style={{ textAlign: 'right', paddingRight: '32px', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
              <span>Scroll for more announcements</span>
              <span style={{ fontSize: '16px', animation: 'bounceX 2s infinite' }}>➔</span>
            </div>
          )}
          <section className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '20px', padding: '0 24px 20px', scrollSnapType: 'x mandatory', alignItems: 'flex-start' }}>
            {announcements.map((ann, idx) => {
              const isSuccess = ann.type === 'success';
              const isWarning = ann.type === 'warning';
              const icon = isSuccess ? '✨' : isWarning ? '⚡' : '🚀';
              const titleColor = isSuccess ? '#4ade80' : isWarning ? '#fbbf24' : '#60a5fa';
              const bgGlow = isSuccess ? 'rgba(74, 222, 128, 0.1)' : isWarning ? 'rgba(251, 191, 36, 0.1)' : 'rgba(96, 165, 250, 0.1)';
              const borderGlow = isSuccess ? 'rgba(74, 222, 128, 0.3)' : isWarning ? 'rgba(251, 191, 36, 0.3)' : 'rgba(96, 165, 250, 0.3)';

              return (
                <div key={ann.id || idx} className="announcement-card" style={{ 
                  flex: '0 0 auto',
                  width: announcements.length > 1 ? 'min(85%, 450px)' : '100%',
                  maxWidth: '600px',
                  height: '420px',
                  scrollSnapAlign: 'center',
                  background: `linear-gradient(145deg, var(--surface), var(--surface2))`, 
                  border: `1px solid ${borderGlow}`, 
                  borderRadius: '20px', 
                  overflow: 'hidden',
                  boxShadow: `0 16px 32px rgba(0,0,0,0.4), 0 0 30px ${bgGlow}`,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: titleColor }} />
                  
                  {ann.mediaUrl && ann.mediaType === 'image' && (
                    <img className="announcement-img" src={ann.mediaUrl} alt="Announcement" style={{ width: '100%', height: '180px', objectFit: 'cover', backgroundColor: 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
                  )}
                  {ann.mediaUrl && ann.mediaType === 'video' && (
                    <video src={ann.mediaUrl} autoPlay loop muted controls style={{ width: '100%', height: '180px', objectFit: 'cover', backgroundColor: 'rgba(0,0,0,0.3)', display: 'block', flexShrink: 0 }} />
                  )}
                  <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', 
                        background: bgGlow, border: `1px solid ${borderGlow}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: titleColor }}>
                          {ann.type === 'info' ? 'System Update' : ann.type === 'success' ? 'Good News' : 'Important Notice'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ann.createdAt ? new Date(ann.createdAt.toMillis ? ann.createdAt.toMillis() : ann.createdAt).toLocaleDateString() : 'Just now'}
                          {ann.updatedAt && (
                            <span style={{ fontStyle: 'italic', marginLeft: '6px', color: 'var(--text-muted)' }}>
                              (Edited: {new Date(ann.updatedAt.toMillis ? ann.updatedAt.toMillis() : ann.updatedAt).toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="announcement-txt" style={{ 
                      fontSize: '15px', lineHeight: 1.5, color: 'var(--text-main)', 
                      margin: 0, whiteSpace: 'pre-wrap', fontWeight: 400,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                    }}>
                      {ann.message.split(/(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/g).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} style={{ color: 'var(--text-main)' }}>{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                          return <em key={i} style={{ color: 'var(--text-main)' }}>{part.slice(1, -1)}</em>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </p>
                    <button 
                      onClick={() => setExpandedAnn(ann)}
                      style={{ marginTop: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                    >
                      Read More <span style={{ fontSize: '14px' }}>➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
          <style>{`
            @keyframes bounceX {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(6px); }
            }
          `}</style>
          
          {/* FULL SCREEN ANNOUNCEMENT MODAL */}
          {expandedAnn && (
            <div style={{ 
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
              <div style={{ 
                background: 'var(--surface)', border: '1px solid var(--border)', 
                borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh',
                overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column'
              }}>
                <button 
                  onClick={() => setExpandedAnn(null)}
                  style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', width: '40px', height: '40px', borderRadius: '20px', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
                {expandedAnn.mediaUrl && expandedAnn.mediaType === 'image' && (
                  <img src={expandedAnn.mediaUrl} alt="Announcement" style={{ width: '100%', height: '250px', objectFit: 'cover', backgroundColor: '#000' }} />
                )}
                {expandedAnn.mediaUrl && expandedAnn.mediaType === 'video' && (
                  <video src={expandedAnn.mediaUrl} autoPlay loop controls style={{ width: '100%', height: '250px', objectFit: 'cover', backgroundColor: '#000' }} />
                )}
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px', color: expandedAnn.type === 'success' ? '#4ade80' : expandedAnn.type === 'warning' ? '#fbbf24' : '#60a5fa', marginBottom: '16px' }}>
                    {expandedAnn.type === 'info' ? 'System Update' : expandedAnn.type === 'success' ? 'Good News' : 'Important Notice'}
                  </div>
                  <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {expandedAnn.message.split(/(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/g).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} style={{ color: '#fff' }}>{part.slice(2, -2)}</strong>;
                      if (part.startsWith('*') && part.endsWith('*')) return <em key={i} style={{ color: '#fff' }}>{part.slice(1, -1)}</em>;
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px 80px' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⏳</div>
            Loading Storefront...
          </div>
        ) : search ? (
          /* SEARCH RESULTS VIEW */
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>Search Results</h2>
            {filteredApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏜️</div>
                <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No Apps Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>We couldn't find any apps matching your search.</p>
              </div>
            ) : (
              <div className="admin-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '24px' }}>
                {filteredApps.map(app => <AppCard key={app.id} app={app} />)}
              </div>
            )}
          </div>
        ) : (
          /* DEFAULT UPTODOWN-STYLE VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            {/* FEATURED CAROUSEL */}
            {carouselApps.length > 0 && (
              <section className="glass-panel" style={{ position: 'relative', height: '400px', borderRadius: '32px', overflow: 'hidden', padding: 0 }}>
                {carouselApps.map((app, idx) => (
                  <div key={app.id} style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    opacity: carouselIdx === idx ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                    pointerEvents: carouselIdx === idx ? 'auto' : 'none'
                  }}>
                    {/* Blurred Background */}
                    <div style={{
                      position: 'absolute', top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
                      backgroundImage: `url(${app.iconUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(60px) brightness(0.3)',
                      zIndex: 0
                    }} />
                    {/* Content */}
                    <div className="featured-content" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', height: '100%', padding: '40px 80px', gap: '48px' }}>
                      <img className="featured-img" src={app.iconUrl} alt={app.appName} style={{ width: '240px', height: '240px', borderRadius: '48px', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <div>
                        <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '12px', fontWeight: 700, marginBottom: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', backdropFilter: 'blur(10px)' }}>
                          Featured App
                        </div>
                        <h2 className="featured-title" style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', color: '#fff', lineHeight: 1.1 }}>{app.appName}</h2>
                        <p className="featured-desc" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '400px', marginBottom: '32px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{app.description}</p>
                        <a className="btn-glass btn-glass-primary" href={`/app?id=${app.id}`}>
                          View Details ➔
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Carousel Indicators */}
                <div style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '12px', zIndex: 2 }}>
                  {carouselApps.map((_, idx) => (
                    <button key={idx} onClick={() => setCarouselIdx(idx)} style={{ width: '12px', height: '12px', borderRadius: '50%', background: carouselIdx === idx ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0 }} />
                  ))}
                </div>
              </section>
            )}

            {/* HORIZONTAL ROWS */}
            
            <HorizontalRow title="Top Downloads" apps={topDownloads.slice(0, 10)} isRanking />
            
            <HorizontalRow title="New Releases" apps={newReleases.slice(0, 10)} />
            
            {categories.map(cat => (
              <HorizontalRow key={cat} title={`${cat} Apps`} apps={apps.filter(a => a.category === cat)} />
            ))}

          </div>
        )}
      </main>
    </div>
  );
}

function HorizontalRow({ title, apps, isRanking = false }: { title: string, apps: AppListing[], isRanking?: boolean }) {
  if (apps.length === 0) return null;
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {title} <span style={{ color: 'var(--c1)', fontSize: '18px' }}>➔</span>
        </h3>
      </div>
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '24px', scrollSnapType: 'x mandatory' }}>
        {apps.map((app, idx) => (
          <AppCard key={app.id} app={app} rank={isRanking ? idx + 1 : undefined} />
        ))}
      </div>
    </section>
  );
}

function AppCard({ app, rank }: { app: AppListing, rank?: number }) {
  return (
    <a href={`/app?id=${app.id}`} style={{ display: 'block', textDecoration: 'none', minWidth: '140px', maxWidth: '140px', flex: '0 0 auto', position: 'relative', scrollSnapAlign: 'start', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '12px' }}>
        {rank !== undefined && (
          <div style={{ position: 'absolute', left: '-20px', bottom: '-20px', fontSize: '120px', fontWeight: 900, color: 'var(--border)', zIndex: 0, lineHeight: 0.8, userSelect: 'none', textShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            {rank}
          </div>
        )}
        <img 
          src={app.iconUrl} 
          alt={app.appName} 
          className="app-glass-icon"
          style={{ width: '100%', height: '100%', borderRadius: '32px', objectFit: 'cover', position: 'relative', zIndex: 1 }}
        />
        <div className="glass-reflection" />
      </div>
      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px', letterSpacing: '0.3px' }}>
        {app.appName}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {app.category} • ⭐ {app.rating ? app.rating.toFixed(1) : 'New'}
      </div>
    </a>
  );
}
