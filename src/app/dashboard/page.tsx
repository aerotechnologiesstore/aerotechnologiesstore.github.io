"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToDeveloperApps, AppListing } from '@/lib/db';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [apps, setApps] = useState<AppListing[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const unsub = subscribeToDeveloperApps(user.uid, (appsData) => {
        setApps(appsData);
      });
      return () => unsub();
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
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Welcome back, {userData?.companyName || user?.displayName}</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>Here is what's happening with your apps today.</p>

      <div className="admin-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Downloads</div>
          <div style={{ fontSize: '42px', fontWeight: 800, color: '#fff' }}>{totalDownloads}</div>
        </div>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Active Apps</div>
          <div style={{ fontSize: '42px', fontWeight: 800, color: '#fff' }}>{activeApps}</div>
        </div>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Avg Rating</div>
          <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--c3)' }}>{avgRating}</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="neon-glow" style={{width: '300px', height: '300px', background: 'var(--c1)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
        
        <div style={{ fontSize: '48px', marginBottom: '16px', position: 'relative', zIndex: 2 }}>🚀</div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', position: 'relative', zIndex: 2 }}>Ready to launch?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px', maxWidth: '500px', fontSize: '16px', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
          Upload your first application to Aero Store and reach millions of verified users across India.
        </p>
        <a href="/dashboard/upload/" className="btn-glass btn-glass-primary" style={{ position: 'relative', zIndex: 2 }}>
          Upload New App
        </a>
      </div>
    </div>
  );
}
