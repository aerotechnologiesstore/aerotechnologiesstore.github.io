"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { subscribeToPublishedApps, subscribeToActiveAnnouncements, AppListing, Announcement, processScheduledApps } from '@/lib/db';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function StorefrontContent() {
  const [apps, setApps] = useState<AppListing[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  
  const searchParams = useSearchParams();
  const search = searchParams?.get('q') || "";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeaturedIndex((prev) => prev + 1);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Decentralized Cron Job: Silently process any apps that are scheduled to go live
    processScheduledApps().catch(console.error);

    const unsubApps = subscribeToPublishedApps((publishedApps) => {
      setApps(publishedApps);
      setLoading(false);
    });
    
    const unsubAnns = subscribeToActiveAnnouncements((anns) => {
      setAnnouncements(anns.filter(a => a.targetAudience !== 'developer'));
    });

    return () => {
      unsubApps();
      unsubAnns();
    };
  }, []);

  const filteredApps = apps.filter(a => 
    a.appName.toLowerCase().includes(search.toLowerCase()) || 
    (a.category && a.category.toLowerCase().includes(search.toLowerCase()))
  );

  const topDownloads = [...apps].sort((a, b) => b.downloads - a.downloads);
  const newReleases = [...apps].sort((a, b) => b.createdAt - a.createdAt);
  const playables = apps.filter(a => a.isPlayable);
  const categories = Array.from(new Set(apps.map(a => a.category))).filter(Boolean);

  const featuredApps = newReleases.slice(0, 5);
  const featuredApp = featuredApps[currentFeaturedIndex % (featuredApps.length || 1)];

  return (
    <>
      <Navigation />
      <main className="w-full max-w-container-max-width mx-auto px-4 sm:px-margin-desktop py-4 sm:py-8 space-y-8 sm:space-y-12">
        
        {search ? (
          /* Search Results */
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">Search Results for "{search}"</h2>
            {filteredApps.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant">
                <span className="material-symbols-outlined text-5xl mb-4 text-on-surface-variant">search_off</span>
                <h3 className="font-headline-md mb-2">No Apps Found</h3>
                <p className="text-on-surface-variant font-body-sm">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-card-gap">
                {filteredApps.map(app => <AppCard key={app.id} app={app} />)}
              </div>
            )}
          </div>
        ) : (
          /* Default Storefront */
          <>
            {/* Announcements */}
            {announcements.length > 0 && (
              <section className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar carousel-container">
                {announcements.map(ann => (
                  <div key={ann.id} className={`min-w-[260px] sm:min-w-[300px] max-w-[400px] flex-shrink-0 rounded-2xl p-3 sm:p-4 border flex items-start gap-3 shadow-sm ${ann.type === 'success' ? 'bg-success-green/10 border-success-green/20' : ann.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-secondary-container/20 border-secondary-container/30'}`}>
                    <span className="material-symbols-outlined mt-1" style={{ color: ann.type === 'success' ? 'var(--success-green)' : ann.type === 'warning' ? '#eab308' : 'var(--secondary)' }}>
                      {ann.type === 'success' ? 'check_circle' : ann.type === 'warning' ? 'warning' : 'info'}
                    </span>
                    <div>
                      <h4 className="font-label-lg font-bold mb-1">{ann.type === 'info' ? 'System Update' : ann.type === 'success' ? 'Good News' : 'Important Notice'}</h4>
                      {ann.mediaUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden shadow-sm border border-outline-variant">
                          <img src={ann.mediaUrl} alt="Announcement" className="w-full max-h-48 object-cover" />
                        </div>
                      )}
                      <p className="text-xs text-on-surface-variant line-clamp-2">{ann.message.replace(/[*_]/g, '')}</p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Hero Section */}
            {featuredApp && (
              <section className="relative w-full h-[280px] sm:h-[360px] md:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-deep-slate/90 via-deep-slate/60 to-deep-slate/30 sm:from-deep-slate/80 sm:via-deep-slate/40 sm:to-transparent z-10"></div>
                <div key={featuredApp.id} className="absolute inset-0 bg-cover bg-center transition-transform duration-700 animate-in fade-in group-hover:scale-105" style={{ backgroundImage: `url(${featuredApp.iconUrl})`, filter: 'blur(10px) brightness(0.6)' }}></div>
                
                <div className="relative z-20 h-full flex flex-col justify-center px-5 sm:px-8 md:px-12 max-w-2xl text-white">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary px-2.5 sm:px-3 py-1 rounded-full mb-3 sm:mb-6 w-fit">
                    <span className="material-symbols-outlined text-xs sm:text-sm">stars</span>
                    <span className="font-label-lg text-[10px] sm:text-xs tracking-wider">NEW RELEASE</span>
                  </div>
                  <h1 key={`title-${featuredApp.id}`} className="text-2xl sm:text-4xl md:text-display-lg font-bold mb-2 sm:mb-4 leading-tight text-white animate-in slide-in-from-bottom-4 fade-in">{featuredApp.appName}</h1>
                  <p key={`desc-${featuredApp.id}`} className="text-sm sm:text-base md:text-body-lg text-surface-variant mb-4 sm:mb-8 opacity-90 line-clamp-2 sm:line-clamp-3 animate-in slide-in-from-bottom-6 fade-in">{featuredApp.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <a href={`/app?id=${featuredApp.id}`} className="bg-primary-container hover:bg-primary transition-all text-on-primary-container px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2 group/btn animate-in slide-in-from-bottom-8 fade-in">
                      Get {featuredApp.appName}
                      <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform text-sm sm:text-base">arrow_forward</span>
                    </a>
                  </div>
                </div>

                <div className="absolute bottom-12 right-12 z-20 hidden lg:block">
                  <div key={`img-${featuredApp.id}`} className="w-48 h-48 relative animate-in zoom-in fade-in">
                    <img src={featuredApp.iconUrl} className="w-full h-full object-cover rounded-[32px] shadow-2xl drop-shadow-[0_0_30px_rgba(255,87,34,0.3)]" alt={featuredApp.appName} />
                  </div>
                </div>

                <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
                  {featuredApps.map((app, idx) => (
                    <div key={`dot-${app.id}`} className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${idx === currentFeaturedIndex % featuredApps.length ? 'w-6 sm:w-8 bg-primary' : 'w-1.5 sm:w-2 bg-white/30'}`}></div>
                  ))}
                </div>
              </section>
            )}

            {/* Category Pills */}
            <section className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              <a href="/" className={`px-5 py-2 rounded-full font-label-lg whitespace-nowrap ${!search ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'}`}>For You</a>
              {categories.map(cat => (
                <a key={cat} href={`/?q=${cat}`} className="bg-surface-container-low text-on-surface-variant hover:bg-surface-variant px-5 py-2 rounded-full font-label-lg transition-colors whitespace-nowrap">
                  {cat}
                </a>
              ))}
            </section>

            {/* Playables Carousel */}
            {playables.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-headline-lg font-bold text-on-surface">Aero Instant Games</h2>
                    <p className="text-on-surface-variant text-xs sm:text-sm">Instant games, no downloads</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-card-gap overflow-x-auto pb-4 sm:pb-6 hide-scrollbar carousel-container">
                  {playables.map((app) => (
                    <a key={app.id} href={`/play?id=${app.id}`} className="w-[42vw] max-w-[200px] sm:w-[180px] md:w-[200px] flex-shrink-0 group cursor-pointer card-lift transition-all duration-300 relative rounded-[24px] overflow-hidden border border-outline-variant hover:border-primary">
                      <div className="aspect-[3/4] bg-surface-container relative">
                        <img src={app.iconUrl} alt={app.appName} className="w-full h-full object-cover" />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        
                        {/* Play Button Area */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-bold text-white text-sm truncate mb-2 drop-shadow-md">{app.appName}</h3>
                          <div className="w-full bg-white/90 text-black py-2.5 rounded-full font-bold text-sm text-center flex items-center justify-center gap-1 group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            Play
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                  {/* Peek Card */}
                  <div className="min-w-[140px] sm:min-w-[200px] flex-shrink-0 opacity-40">
                    <div className="aspect-[3/4] bg-surface-container rounded-2xl sm:rounded-3xl border border-outline-variant border-dashed"></div>
                  </div>
                </div>
              </section>
            )}

            {/* Top Downloads Carousel */}
            {topDownloads.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-headline-lg font-bold text-on-surface">Top Downloads</h2>
                    <p className="text-on-surface-variant text-xs sm:text-sm">The most popular picks from the community this week.</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-card-gap overflow-x-auto pb-4 sm:pb-6 hide-scrollbar carousel-container">
                  {topDownloads.map((app, idx) => (
                    <AppCard key={app.id} app={app} rank={idx + 1} isLarge />
                  ))}
                  {/* Peek Card */}
                  <div className="min-w-[140px] sm:min-w-[200px] flex-shrink-0 opacity-40">
                    <div className="aspect-square bg-surface-container rounded-2xl sm:rounded-3xl"></div>
                  </div>
                </div>
              </section>
            )}

            {/* New Releases Grid */}
            {newReleases.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-4 sm:mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-headline-lg font-bold text-on-surface">New Releases</h2>
                    <p className="text-on-surface-variant text-xs sm:text-sm">Fresh arrivals just landed in the Aero Store ecosystem.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-gutter">
                  {/* Highlight Card for the newest app */}
                  {newReleases[0] && (
                    <a href={`/app?id=${newReleases[0].id}`} className="md:col-span-2 md:row-span-2 bg-surface-container-low rounded-2xl sm:rounded-[32px] p-5 sm:p-8 flex flex-col justify-between border border-outline-variant hover:border-primary transition-all group overflow-hidden relative">
                      <div className="relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface rounded-xl sm:rounded-2xl mb-4 sm:mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1 overflow-hidden">
                          <img src={newReleases[0].iconUrl} alt={newReleases[0].appName} className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-headline-lg font-bold mb-2">{newReleases[0].appName}</h3>
                        <p className="text-on-surface-variant text-sm sm:text-base max-w-sm mb-4 sm:mb-6 line-clamp-3">{newReleases[0].description}</p>
                        <div className="flex items-center gap-3">
                          <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">NEW</span>
                          <span className="text-on-surface-variant text-xs sm:text-sm">{newReleases[0].category || 'App'} • {newReleases[0].rating ? newReleases[0].rating.toFixed(1) + ' ★' : 'New'}</span>
                        </div>
                      </div>
                      <button className="mt-5 sm:mt-8 bg-surface text-primary border border-primary px-6 sm:px-6 py-2.5 rounded-xl text-sm font-bold self-start group-hover:bg-primary group-hover:text-white transition-all">Download Now</button>
                    </a>
                  )}

                  {/* Secondary Cards for the rest */}
                  {newReleases.slice(1, 5).map(app => (
                    <a key={app.id} href={`/app?id=${app.id}`} className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-outline-variant hover:shadow-lg transition-all flex gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-surface-container rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center p-0.5 sm:p-1 overflow-hidden">
                        <img src={app.iconUrl} alt={app.appName} className="w-full h-full object-cover rounded-md sm:rounded-lg" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm sm:text-base truncate">{app.appName}</h4>
                        <p className="text-xs text-on-surface-variant mb-1 truncate">{app.category || 'App'}</p>
                        <div className="flex items-center text-xs font-bold text-aero-orange-vibrant">{app.rating ? app.rating.toFixed(1) + ' ★' : 'New'}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}


          </>
        )}
      </main>

      {/* SEO & AdSense Text Block */}
      <section className="max-w-container-max-width mx-auto px-6 py-12 mt-12 border-t border-outline-variant/30">
        <h2 className="text-2xl font-bold text-on-surface mb-4">Welcome to Aero Store: The Next Generation App Marketplace</h2>
        <div className="text-on-surface-variant font-body-lg leading-relaxed space-y-4">
          <p>
            Aero Store is a decentralized, highly secure application marketplace designed to empower independent developers and protect users. 
            In a digital ecosystem dominated by walled gardens and excessive fees, we provide an open platform where innovation thrives without borders. 
            Our platform hosts a wide variety of Android applications, ranging from productivity tools and educational software to offline gaming experiences like Ludo and Tic Tac Toe.
          </p>
          <p>
            Every single application submitted to Aero Store undergoes a rigorous, multi-layered security analysis before it reaches our public catalog. 
            We utilize advanced Artificial Intelligence to scan app metadata for policy compliance, and we route all installation binaries through VirusTotal's 
            comprehensive array of anti-malware engines. This military-grade security pipeline ensures that our users can download and explore new software 
            with absolute peace of mind.
          </p>
          <p>
            For developers, Aero Store offers unprecedented freedom. Enjoy unlimited APK storage powered by Archive.org's decentralized infrastructure, 
            alongside lightning-fast media delivery via Supabase. We enforce strict intellectual property rights through our comprehensive DMCA policy, 
            ensuring a fair, clean, and highly professional environment for creators to distribute their hard work to a global audience.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}

function AppCard({ app, rank, isLarge = false }: { app: AppListing, rank?: number, isLarge?: boolean }) {
  if (isLarge) {
    return (
      <a href={`/app?id=${app.id}`} className="w-[42vw] max-w-[200px] sm:w-[180px] md:w-[200px] flex-shrink-0 group cursor-pointer card-lift transition-all duration-300">
        <div className="aspect-square bg-surface-container rounded-2xl sm:rounded-3xl overflow-hidden mb-2 sm:mb-3 relative p-0.5 sm:p-1 shadow-inner">
          <img src={app.iconUrl} alt={app.appName} className="w-full h-full object-cover rounded-[14px] sm:rounded-[20px]" />
        </div>
        <h3 className="font-bold text-sm sm:text-base truncate mb-0.5 sm:mb-1">{app.appName}</h3>
        <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
          <span className="material-symbols-outlined text-aero-orange-vibrant text-xs sm:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="text-[10px] sm:text-xs font-bold">{app.rating ? app.rating.toFixed(1) : 'New'}</span>
          <span className="text-on-surface-variant text-[9px] sm:text-[10px]">• {app.downloads} Downloads</span>
        </div>
        <p className="text-on-surface-variant text-xs truncate">{app.category || 'App'}</p>
      </a>
    );
  }

  // Small standard card for search results
  return (
    <a href={`/app?id=${app.id}`} className="flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform">
      <div className="aspect-square bg-surface-container rounded-2xl overflow-hidden mb-3 relative p-1">
        <img src={app.iconUrl} alt={app.appName} className="w-full h-full object-cover rounded-[12px] shadow-sm" />
      </div>
      <h3 className="font-label-lg truncate">{app.appName}</h3>
      <p className="text-xs text-on-surface-variant truncate mb-1">{app.category}</p>
      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-aero-orange-vibrant text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="text-[12px] font-bold">{app.rating ? app.rating.toFixed(1) : 'New'}</span>
      </div>
    </a>
  );
}

export default function StorefrontPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Suspense fallback={<div className="h-screen flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>}>
        <StorefrontContent />
      </Suspense>
    </div>
  );
}
