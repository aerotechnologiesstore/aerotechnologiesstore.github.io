"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToDeveloperApps, deleteApp, AppListing } from '@/lib/db';

export default function MyAppsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToDeveloperApps(user.uid, (data) => {
      setApps(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this app? This action cannot be undone and will instantly remove it from the store.")) return;
    try {
      await deleteApp(appId);
    } catch (e) {
      console.error(e);
      alert("Failed to delete app.");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>My Apps</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>Manage all your published and pending applications.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>Loading apps...</div>
      ) : apps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No Apps Published Yet</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px', maxWidth: '400px' }}>
            Once you upload your first app, it will appear here. You can manage updates, check reviews, and track downloads.
          </p>
          <a href="/dashboard/upload/" className="btn-glass btn-glass-primary">
            Upload Your First App
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {apps.map(app => (
            <div key={app.id} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <img src={app.iconUrl} alt="Icon" style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover' }} />
              <div style={{ flex: '1 1 250px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>{app.appName}</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>v{app.version}</span>
                  <span style={{ fontSize: '13px', padding: '4px 8px', background: app.status === 'published' ? 'rgba(76, 175, 80, 0.2)' : app.status === 'rejected' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(255, 179, 0, 0.2)', color: app.status === 'published' ? '#4caf50' : app.status === 'rejected' ? '#ff4d4d' : '#ffb300', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{app.description}</p>
              </div>
              <div className="w-full-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Downloads</div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{app.downloads}</div>
                </div>
                <a href={`/dashboard/update?id=${app.id}`} style={{ padding: '12px', background: 'rgba(0,163,255,0.1)', color: '#00A3FF', border: '1px solid rgba(0,163,255,0.3)', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s', display: 'block' }}>
                  Update App
                </a>
                <button onClick={() => handleDelete(app.id)} style={{ padding: '12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Delete App
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
