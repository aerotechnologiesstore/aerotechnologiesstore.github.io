"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function NavigationInner() {
  const { user, userData } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams?.get('q') || '');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [expandedNotifs, setExpandedNotifs] = useState<Record<string, boolean>>({});
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let unsubscribe: any;
    import('@/lib/db').then(({ subscribeToNotifications, markSpecificNotificationsAsRead, cleanupExpiredNotifications }) => {
      cleanupExpiredNotifications(user.uid);
      unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
        const currentPath = window.location.pathname;
        const supportNotifsToMarkRead = notifs.filter(n => 
          !n.read && (n.title.toLowerCase().includes('support') || n.title.toLowerCase().includes('agent reply'))
        );
        
        if (currentPath === '/support' && supportNotifsToMarkRead.length > 0) {
          const ids = supportNotifsToMarkRead.map(n => n.id).filter(Boolean) as string[];
          markSpecificNotificationsAsRead(ids);
          // Map them to read locally to prevent a split-second UI flash of the unread badge
          notifs = notifs.map(n => ids.includes(n.id!) ? { ...n, read: true } : n);
        }

        setNotifications(notifs);
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = async () => {
    setNotifDropdownOpen(!notifDropdownOpen);
    if (!notifDropdownOpen && notifications.some(n => !n.read) && user) {
      const { markNotificationsAsRead } = await import('@/lib/db');
      await markNotificationsAsRead(user.uid);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search) {
      router.push(`/?q=${encodeURIComponent(search)}`);
    } else {
      router.push('/');
    }
  };

  // Prefer userData photo over user photo, and fallback to initials
  const profilePhoto = userData?.photoURL || user?.photoURL;
  const initial = (userData?.displayName || user?.displayName || "U")[0].toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface shadow-sm border-b border-surface-variant transition-colors duration-500">
        <div className="flex justify-between items-center h-16 px-4 sm:px-margin-desktop w-full max-w-container-max-width mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              Aero Store
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className={`font-label-lg text-label-lg transition-colors ${pathname === '/' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>Apps</Link>
              <Link href="/developers" className={`font-label-lg text-label-lg transition-colors ${pathname?.includes('/developers') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>Developers</Link>
            </nav>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center gap-4 flex-1 max-w-md mx-8 hidden md:flex">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full h-10 pl-10 pr-4 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary text-body-sm transition-all" 
                placeholder="Search apps, games, and more..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button onClick={handleNotifClick} className="relative p-2 rounded-full hover:bg-surface-container-low transition-all" title="Notifications">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {notifDropdownOpen && (
                <div className="absolute right-[-48px] md:right-0 mt-2 w-[300px] sm:w-80 max-h-[70vh] md:max-h-96 overflow-y-auto bg-surface-container-low border border-surface-variant rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-headline-sm font-bold p-3 text-on-surface border-b border-surface-variant">Notifications</h3>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-on-surface-variant font-body-sm">No new notifications</div>
                  ) : (
                    <div className="flex flex-col gap-1 mt-2">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { if (n.actionUrl) router.push(n.actionUrl); setNotifDropdownOpen(false); }}
                          className={`p-3 rounded-xl cursor-pointer transition-colors ${!n.read ? 'bg-surface-variant/50' : 'hover:bg-surface-variant/30'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {n.important ? (
                              <span className="material-symbols-outlined text-sm text-red-500" title="Important Notification">priority_high</span>
                            ) : (
                              <span className="material-symbols-outlined text-sm text-primary">admin_panel_settings</span>
                            )}
                            <div className="font-label-md font-bold text-on-surface flex-1">{n.title}</div>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const { toggleNotificationSaved } = await import('@/lib/db');
                                await toggleNotificationSaved(n.id, !n.saved);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-colors"
                              title={n.saved ? "Unsave Notification" : "Save Notification"}
                            >
                              <span className={`material-symbols-outlined text-[18px] ${n.saved ? 'text-primary' : 'text-on-surface-variant/50'}`} style={{ fontVariationSettings: n.saved ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                            </button>
                          </div>
                          <div className={`font-body-sm text-on-surface-variant ${expandedNotifs[n.id] ? '' : 'line-clamp-3'}`}>{n.message}</div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="font-body-sm text-xs text-on-surface-variant/60">
                              {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : 'Just now'}
                            </div>
                            <div className="flex gap-4 items-center">
                              {n.link && (
                                <Link 
                                  href={n.link} 
                                  className="text-xs text-primary font-bold hover:underline bg-primary/10 px-3 py-1 rounded-full"
                                  onClick={() => setNotifDropdownOpen(false)}
                                >
                                  Open Link
                                </Link>
                              )}
                              <span className="text-xs text-primary font-bold opacity-60">
                                {expandedNotifs[n.id] ? 'Show Less' : 'Read More'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {userData?.role === 'admin' && (
                  <Link href="/admin" className="font-label-lg text-error hover:underline text-sm font-bold">Admin</Link>
                )}
                {(userData?.role === 'developer' || userData?.role === 'admin') && (
                  <Link href="/dashboard" className="font-label-lg text-primary hover:underline text-sm font-bold">Dashboard</Link>
                )}
                <Link href="/profile" className="w-10 h-10 rounded-full border-2 border-surface-container overflow-hidden hover:scale-105 transition-transform bg-surface-container-low flex items-center justify-center text-primary font-bold">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : initial}
                </Link>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex bg-primary text-on-primary px-4 py-2 rounded-full font-label-lg hover:bg-primary-container transition-colors">
                Log in
              </Link>
            )}

            {/* Mobile Search Button */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-surface-container-low transition-all"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <span className="material-symbols-outlined text-on-surface-variant">{mobileSearchOpen ? 'close' : 'search'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-surface-container-low transition-all"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (slides down) */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 bg-surface border-b border-surface-variant animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={(e) => { handleSearch(e); setMobileSearchOpen(false); }} className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input 
                className="w-full h-11 pl-10 pr-4 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary text-sm transition-all" 
                placeholder="Search apps, games..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}
      </header>

      {/* Full-Screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-surface p-8 flex flex-col border-l border-surface-variant animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                <span className="font-headline-sm text-on-surface">Aero Store</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Mobile Menu Links */}
            <div className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 p-4 rounded-xl font-label-lg text-lg transition-colors ${pathname === '/' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined">home</span> Home
              </Link>
              <Link href="/developers" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 p-4 rounded-xl font-label-lg text-lg transition-colors ${pathname?.includes('/developers') ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined">code</span> For Developers
              </Link>

              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 p-4 rounded-xl font-label-lg text-lg transition-colors ${pathname?.includes('/profile') ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}>
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined">person</span>
                    )}
                    My Profile
                  </Link>

                  {(userData?.role === 'developer' || userData?.role === 'admin') && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl font-label-lg text-lg bg-surface-container-low text-on-surface hover:bg-surface-container">
                      <span className="material-symbols-outlined">dashboard</span> Developer Dashboard
                    </Link>
                  )}

                  {userData?.role === 'admin' && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl font-label-lg text-lg bg-error-container text-on-error-container hover:bg-error transition-colors">
                      <span className="material-symbols-outlined">admin_panel_settings</span> Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-4 p-4 rounded-xl font-label-lg text-lg bg-primary text-on-primary mt-4">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navigation() {
  return (
    <Suspense fallback={<div className="h-16 bg-surface border-b border-surface-variant"></div>}>
      <NavigationInner />
    </Suspense>
  );
}
