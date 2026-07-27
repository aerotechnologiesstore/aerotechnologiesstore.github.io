"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { subscribeToActiveAnnouncements, Announcement } from '@/lib/db';
import Link from 'next/link';

export default function DevelopersPage() {
  const { user, userData } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const unsub = subscribeToActiveAnnouncements((anns) => {
      setAnnouncements(anns.filter(a => a.targetAudience !== 'user'));
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navigation />

      <main className="flex-1 w-full max-w-container-max-width mx-auto px-margin-desktop py-12">
        {/* HERO */}
        <section className="relative text-center py-20 rounded-[40px] bg-surface-container-lowest border border-outline-variant shadow-sm overflow-hidden mb-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container mb-6 border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-lg text-xs tracking-widest text-on-surface-variant uppercase">India's Premium Developer Platform</span>
          </div>

          <h1 className="font-display-lg text-4xl md:text-6xl mb-6 text-on-surface leading-tight">
            Build. Distribute.<br/>
            <span className="text-primary">Get Discovered.</span>
          </h1>
          
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Aero Store is India's independent app marketplace — where verified developers publish secure apps, and users discover software they can trust. Zero bloatware. Clean installs only.
          </p>

          <div className="flex gap-4 justify-center items-center relative z-10 flex-wrap">
            {user && (userData?.role === 'developer' || userData?.role === 'admin') ? (
              <Link href="/dashboard" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-headline-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/register/developer" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-headline-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md">
                Join the Developer Program
              </Link>
            )}
            <Link href="/" className="bg-surface-container text-on-surface px-8 py-4 rounded-xl font-headline-sm hover:bg-surface-variant transition-all border border-outline-variant">
              Explore the Store
            </Link>
          </div>
        </section>

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="mb-20 max-w-4xl mx-auto">
            <h3 className="font-label-lg text-on-surface-variant uppercase tracking-widest mb-6 text-center">Platform Announcements</h3>
            <div className="flex flex-col gap-4">
              {announcements.map(ann => (
                <div key={ann.id} className={`p-6 rounded-2xl border-l-4 ${ann.type === 'success' ? 'border-success-green bg-success-green/5' : ann.type === 'warning' ? 'border-yellow-500 bg-yellow-500/5' : 'border-secondary bg-secondary/5'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className={`font-label-lg uppercase tracking-wider ${ann.type === 'success' ? 'text-success-green' : ann.type === 'warning' ? 'text-yellow-600' : 'text-secondary'}`}>
                      {ann.type === 'info' ? 'System Update' : ann.type === 'success' ? 'Good News' : 'Important Notice'}
                    </div>
                    <div className="text-xs text-on-surface-variant font-body-sm">
                      {ann.createdAt ? new Date(ann.createdAt.toMillis ? ann.createdAt.toMillis() : ann.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  {ann.mediaUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-outline-variant bg-surface flex items-center justify-center">
                      <img src={ann.mediaUrl} alt="Announcement Media" className="w-full max-h-[400px] object-contain" />
                    </div>
                  )}
                  <p className="font-body-md text-on-surface whitespace-pre-wrap">{ann.message.replace(/[*_]/g, '')}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FEATURES - BENTO GRID */}
        <section className="py-12" id="platform">
          <div className="text-center mb-16">
            <h2 className="font-display-lg text-3xl md:text-5xl mb-4">Engineered for <span className="text-primary">Trust.</span></h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">We built Aero Store because developers deserve a fair, transparent, and secure marketplace without gatekeeping.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Item 1 - Large */}
            <div className="md:col-span-3 bg-surface-container-low p-10 md:p-16 rounded-[40px] flex flex-col md:flex-row gap-10 items-center border border-outline-variant">
              <div className="flex-1">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-6 text-3xl shadow-sm">🛡️</div>
                <h3 className="font-headline-lg text-3xl mb-4 text-on-surface">Verified Developers Only</h3>
                <p className="font-body-lg text-on-surface-variant">Every developer on our platform goes through mandatory identity and address verification. No anonymous uploads, no shady accounts. Every app is traceable to a real person or company.</p>
              </div>
              <div className="w-full md:w-auto bg-surface p-6 rounded-3xl border border-outline-variant shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success-green flex items-center justify-center text-white text-2xl font-bold">✓</div>
                <div>
                  <div className="font-headline-sm text-on-surface">Identity Verified</div>
                  <div className="font-body-sm text-on-surface-variant">Aero Store Trust & Safety</div>
                </div>
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant">
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center mb-6 text-2xl shadow-sm">🔍</div>
              <h3 className="font-headline-md mb-3 text-on-surface">Automated Scanning</h3>
              <p className="font-body-md text-on-surface-variant">Every uploaded APK passes through multi-layer security scans. Malicious or suspicious code is flagged and blocked instantly.</p>
            </div>

            {/* Bento Item 3 */}
            <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant">
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center mb-6 text-2xl shadow-sm">⚖️</div>
              <h3 className="font-headline-md mb-3 text-on-surface">Fair Disputes</h3>
              <p className="font-body-md text-on-surface-variant">Every complaint is tracked transparently with timestamped audit trails — no black-box decisions or automated takedowns without review.</p>
            </div>

            {/* Bento Item 4 */}
            <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant">
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center mb-6 text-2xl shadow-sm">🤖</div>
              <h3 className="font-headline-md mb-3 text-on-surface">AI-Powered Moderation</h3>
              <p className="font-body-md text-on-surface-variant">Powered by Google Gemini — our AI reviews app descriptions, scans metadata, and auto-flags policy violations before human review.</p>
            </div>
            
            {/* Bento Item 5 */}
            <div className="md:col-span-3 bg-surface-container-highest p-10 md:p-16 rounded-[40px] flex flex-col md:flex-row gap-10 items-center justify-between border border-outline-variant mt-4">
              <div className="max-w-xl">
                <h3 className="font-headline-lg text-3xl mb-4 text-on-surface">Ship Your App to <span className="text-primary">Thousands.</span></h3>
                <p className="font-body-lg text-on-surface-variant mb-8">Aero Store is open for developer registrations. Track downloads, ratings, user feedback, and geographic distribution from one clean dashboard. Free to publish, forever.</p>
                <div className="flex gap-4">
                  {user && (userData?.role === 'developer' || userData?.role === 'admin') ? (
                    <Link href="/dashboard" className="bg-primary text-white px-6 py-3 rounded-xl font-label-lg hover:bg-primary-container transition-colors">Go to Dashboard</Link>
                  ) : (
                    <Link href="/register/developer" className="bg-primary text-white px-6 py-3 rounded-xl font-label-lg hover:bg-primary-container transition-colors">Register as Developer</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
