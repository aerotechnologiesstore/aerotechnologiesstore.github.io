"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToDeveloperApps, subscribeToActiveAnnouncements, AppListing, Announcement } from '@/lib/db';
import Link from 'next/link';

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
  
  const ratedApps = apps.filter(a => a.ratingCount && a.ratingCount > 0);
  const avgRating = ratedApps.length > 0 
    ? (ratedApps.reduce((sum, app) => sum + (app.rating || 0), 0) / ratedApps.length).toFixed(1)
    : '--';

  return (
    <div className="w-full max-w-container-max-width mx-auto">
      <h1 className="font-display-lg text-4xl font-bold mb-2 text-on-surface">Welcome back, {userData?.companyName || user?.displayName}</h1>
      <p className="font-body-lg text-on-surface-variant mb-10">Here is what's happening with your apps today.</p>

      {/* DEVELOPER ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div className="mb-10">
          <h2 className="font-headline-md text-xl font-bold mb-4 text-on-surface">Platform Announcements</h2>
          <div className="flex flex-col gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className={`p-6 rounded-2xl border-l-4 ${ann.type === 'success' ? 'border-success-green bg-success-green/5' : ann.type === 'warning' ? 'border-yellow-500 bg-yellow-500/5' : 'border-secondary bg-secondary/5'} shadow-sm`}>
                <div className={`font-label-lg uppercase tracking-wider mb-2 ${ann.type === 'success' ? 'text-success-green' : ann.type === 'warning' ? 'text-yellow-600' : 'text-secondary'}`}>
                  {ann.type === 'info' ? 'System Update' : ann.type === 'success' ? 'Good News' : 'Important Notice'}
                </div>
                {ann.mediaUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-outline-variant bg-surface flex items-center justify-center">
                    <img src={ann.mediaUrl} alt="Announcement Media" className="w-full max-h-[400px] object-contain" />
                  </div>
                )}
                <p className="font-body-md text-on-surface whitespace-pre-wrap leading-relaxed mb-3">
                  {ann.message.replace(/[*_]/g, '')}
                </p>
                <div className="text-xs text-on-surface-variant font-body-sm">
                  {ann.createdAt ? new Date(ann.createdAt.toMillis ? ann.createdAt.toMillis() : ann.createdAt).toLocaleDateString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant shadow-sm hover:border-primary transition-colors">
          <div className="font-label-lg text-on-surface-variant uppercase tracking-widest mb-2 text-xs">Total Downloads</div>
          <div className="font-display-lg text-5xl font-bold text-on-surface">{totalDownloads}</div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant shadow-sm hover:border-primary transition-colors">
          <div className="font-label-lg text-on-surface-variant uppercase tracking-widest mb-2 text-xs">Active Apps</div>
          <div className="font-display-lg text-5xl font-bold text-on-surface">{activeApps}</div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant shadow-sm hover:border-primary transition-colors">
          <div className="font-label-lg text-on-surface-variant uppercase tracking-widest mb-2 text-xs">Avg Rating</div>
          <div className="font-display-lg text-5xl font-bold text-primary">{avgRating}</div>
        </div>
      </div>

      {/* UPLOAD CTA */}
      <div className="bg-surface-container-highest p-12 rounded-[40px] border border-outline-variant text-center shadow-sm relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-surface rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-outline-variant group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <h2 className="font-display-lg text-3xl font-bold mb-4 text-on-surface">Ready to launch?</h2>
          <p className="font-body-lg text-on-surface-variant mb-8 max-w-lg mx-auto">
            Upload your first application to Aero Store and reach millions of verified users across India.
          </p>
          <Link href="/dashboard/upload" className="inline-block bg-primary text-on-primary px-8 py-4 rounded-xl font-headline-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md">
            Upload New App
          </Link>
        </div>
      </div>
    </div>
  );
}
