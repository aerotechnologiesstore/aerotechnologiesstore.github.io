"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToDeveloperApps, subscribeToActiveAnnouncements, AppListing, Announcement } from '@/lib/db';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [apps, setApps] = useState<AppListing[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const unsubApps = subscribeToDeveloperApps(user.uid, (appsData) => {
        setApps(appsData);
      });
      const unsubAnns = subscribeToActiveAnnouncements((anns) => {
        // Show announcements meant for all or developer
        setAnnouncements(anns.filter(a => a.targetAudience !== 'user'));
      });
      return () => {
        unsubApps();
        unsubAnns();
      };
    }
  }, [user]);

  const activeApps = apps.filter(a => a.status === 'published').length;
  const totalDownloads = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);
  
  // Calculate average rating across all apps that have a rating
  const ratedApps = apps.filter(a => a.ratingCount && a.ratingCount > 0);
  const avgRating = ratedApps.length > 0 
    ? (ratedApps.reduce((sum, app) => sum + (app.rating || 0), 0) / ratedApps.length).toFixed(1)
    : '--';

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>Welcome back, {userData?.companyName || user?.displayName}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Here is what's happening with your apps today.</p>

      {/* DEVELOPER ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Platform Announcements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map((ann) => (
              <div key={ann.id} className="glass-panel" style={{ padding: '24px', borderLeft: `4px solid ${ann.type === 'success' ? '#4ade80' : ann.type === 'warning' ? '#fbbf24' : '#60a5fa'}` }}>
                <div style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: ann.type === 'success' ? '#4ade80' : ann.type === 'warning' ? '#fbbf24' : '#60a5fa', marginBottom: '8px' }}>
                  {ann.type === 'info' ? 'System Update' : ann.type === 'success' ? 'Good News' : 'Important Notice'}
                </div>
                <p style={{ fontSize: '15px', color: 'var(--text-main)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {ann.message.split(/(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/g).map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
                    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
                    return <span key={i}>{part}</span>;
                  })}
                </p>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                  {ann.createdAt ? new Date(ann.createdAt.toMillis ? ann.createdAt.toMillis() : ann.createdAt).toLocaleDateString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Downloads</div>
          <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-main)' }}>{totalDownloads}</div>
        </div>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Active Apps</div>
          <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-main)' }}>{activeApps}</div>
        </div>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Avg Rating</div>
          <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--c3)' }}>{avgRating}</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="neon-glow" style={{width: '300px', height: '300px', background: 'var(--c1)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
        
        <div style={{ fontSize: '48px', marginBottom: '16px', position: 'relative', zIndex: 2 }}>🚀</div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', position: 'relative', zIndex: 2, color: 'var(--text-main)' }}>Ready to launch?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '500px', fontSize: '16px', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
          Upload your first application to Aero Store and reach millions of verified users across India.
        </p>
        <a href="/dashboard/upload/" className="btn-glass btn-glass-primary" style={{ position: 'relative', zIndex: 2 }}>
          Upload New App
        </a>
      </div>
    </div>
  );
}
