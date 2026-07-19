"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAppById, incrementAppDownloadCount, getReviewsForApp, Review, recordAppDownload } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

function AppDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [app, setApp] = useState<any>(null);
  const [developerInfo, setDeveloperInfo] = useState<{name: string, company: string, email: string, orgEmail?: string, address?: string, verified?: boolean} | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { user, userData } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Collapse states
  const [supportOpen, setSupportOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    async function loadApp() {
      if (!id) {
        router.push('/');
        return;
      }
      try {
        const data = await getAppById(id);
        if (data) {
          setApp(data);
          
          try {
            const revs = await getReviewsForApp(id);
            setReviews(revs);
          } catch(e) {}

          // Fetch developer details
          try {
            const devSnap = await getDoc(doc(db, 'developers', data.developerId));
            const userSnap = await getDoc(doc(db, 'users', data.developerId));
            
            let dName = "Aero Developer";
            let dEmail = "developer@aerostore.com";
            let dCompany = "Aero Store";
            let dAddress = undefined;
            let dOrgEmail = undefined;
            let dVerified = false;

            if (userSnap.exists()) {
              dName = userSnap.data().displayName || dName;
              dEmail = userSnap.data().email || dEmail;
            }
            
            if (devSnap.exists()) {
              const devData = devSnap.data();
              dCompany = devData.companyName || dCompany;
              dOrgEmail = devData.organizationEmail;
              dVerified = !!devData.hasVerificationBadge;
              
              if (!devData.addressPrivate) {
                // Strip out the phone number if it was concatenated during registration
                let rawAddress = devData.address || "";
                rawAddress = rawAddress.replace(/,\s*Phone:\s*\+?\d+/i, '');
                dAddress = rawAddress;
              }
            }

            setDeveloperInfo({
              name: dName,
              company: dCompany,
              email: dEmail,
              orgEmail: dOrgEmail,
              address: dAddress,
              verified: dVerified
            });
          } catch(e) {
            console.error("Error fetching dev details", e);
          }
        }
      } catch (e) {
        console.error("Error loading app", e);
      }
      setLoading(false);
    }
    loadApp();
  }, [id, router]);

  const handleDownload = async () => {
    if (!app || downloading) return;

    if (!user) {
      alert("You must be logged in to download apps. Please register or log in.");
      router.push('/login/');
      return;
    }

    setDownloading(true);
    
    try {
      await incrementAppDownloadCount(app.id);
      await recordAppDownload(user.uid, app.id, app.appName, app.iconUrl);
      
      const link = document.createElement('a');
      link.href = app.apkUrl;
      link.setAttribute('download', `${app.appName}.apk`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setApp((prev: any) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    } catch (e) {
      console.error("Download error", e);
      alert("Failed to start download. Please try again.");
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
        <Navigation />
        <div style={{ paddingTop: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ color: 'var(--c2)', fontSize: '24px', fontWeight: 'bold' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
        <Navigation />
        <div style={{ paddingTop: '80px', textAlign: 'center', marginTop: '100px' }}>
          <h1>App not found</h1>
          <button onClick={() => router.push('/')} style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--c1)', color: '#fff', border: 'none', borderRadius: '100px', cursor: 'pointer' }}>Back to Store</button>
        </div>
      </div>
    );
  }

  const devDisplayName = (developerInfo?.company && developerInfo.company !== 'Aero Store') ? developerInfo.company : (developerInfo?.name || "Developer");
  const displayRating = app.rating ? app.rating.toFixed(1) : "0.0";
  const reviewCountStr = app.ratingCount > 1000 ? (app.ratingCount / 1000).toFixed(1) + 'k reviews' : `${app.ratingCount || 0} reviews`;

  const ratingsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalReviews = reviews.length;
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) ratingsCount[r.rating as 1|2|3|4|5]++;
  });

  const getRatingWidth = (num: number) => {
    if (totalReviews === 0) return '0%';
    return `${(ratingsCount[num as 1|2|3|4|5] / totalReviews) * 100}%`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', paddingBottom: '80px' }}>
      <Navigation />
      
      <div style={{ position: 'relative', paddingTop: '80px', maxWidth: '900px', margin: '0 auto', padding: '120px 20px 80px 20px' }}>
        <div className="neon-glow" style={{width: '600px', height: '600px', background: 'var(--c1)', top: '10%', left: '50%', transform: 'translate(-50%, -10%)'}} />
        
        <div className="glass-panel" style={{ padding: '48px', position: 'relative', zIndex: 2 }}>
        {/* Play Store Style Header */}
        <div className="flex-col-mobile" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
          <img 
            src={app.iconUrl} 
            alt={app.appName} 
            style={{ width: '120px', height: '120px', borderRadius: '24px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} 
          />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 4px 0', lineHeight: 1.2 }}>{app.appName}</h1>
            <div style={{ fontSize: '16px', color: 'var(--c1)', fontWeight: 600, marginBottom: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {devDisplayName}
              {developerInfo?.verified && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#00A3FF" xmlns="http://www.w3.org/2000/svg">
                  <title>Verified Aero Developer</title>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Contains ads • In-app purchases</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center', marginBottom: '32px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 'max-content' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {displayRating} <span style={{ fontSize: '14px' }}>★</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{reviewCountStr}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 'max-content' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>18+</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Rated for 18+</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 'max-content' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{app.downloads}+ Downloads</div>
          </div>
        </div>

        {/* Install Button */}
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="btn-glass btn-glass-primary"
          style={{ width: '100%', padding: '18px', fontSize: '18px', marginBottom: '48px', opacity: downloading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {downloading ? 'Downloading...' : 'Download Now'}
        </button>

        {/* What's New */}
        {app.whatsNew && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>What's new</h2>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {app.whatsNew}
            </div>
          </div>
        )}

        {/* About this game/app */}
        <div style={{ marginBottom: '32px' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '16px' }}
            onClick={() => setAboutOpen(!aboutOpen)}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>About this {app.category?.toLowerCase() === 'games' ? 'game' : 'app'}</h2>
            <div style={{ transform: aboutOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '20px' }}>→</div>
          </div>

          {!developerInfo?.verified && (
            <div style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '20px' }}>⚠️</div>
              <div>
                <strong style={{ color: '#FFB300', display: 'block', marginBottom: '4px', fontSize: '14px' }}>This developer is not verified.</strong>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Aero Store has not verified the identity or organization details of this developer. Please proceed with caution.</span>
              </div>
            </div>
          )}

          <div style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '14px', 
            lineHeight: 1.6, 
            whiteSpace: 'pre-wrap',
            maxHeight: aboutOpen || (app.description && app.description.length <= 150) ? 'none' : '60px',
            overflow: 'hidden',
            position: 'relative',
            transition: 'max-height 0.3s ease'
          }}>
            {app.description}
            {!aboutOpen && app.description && app.description.length > 150 && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, var(--bg))' }} />
            )}
          </div>
        </div>

        {/* Data Safety Placeholder */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Data safety</h2>
            <div style={{ fontSize: '20px' }}>→</div>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px', lineHeight: 1.5 }}>
            Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region and age. The developer provided this information and may update it over time.
          </p>
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
            {!app.dataCollected && !app.dataShared && !app.dataEncrypted && !app.accountDeletion ? (
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>No data safety information provided by the developer.</div>
            ) : (
              <>
                {app.dataShared && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '20px', opacity: 0.7 }}>🔗</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>This app may share data with third parties</div>
                    </div>
                  </div>
                )}
                {app.dataCollected && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '20px', opacity: 0.7 }}>☁️</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>This app collects user data</div>
                    </div>
                  </div>
                )}
                {app.dataEncrypted && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '20px', opacity: 0.7 }}>🔒</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Data is encrypted in transit</div>
                    </div>
                  </div>
                )}
                {app.accountDeletion && (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ fontSize: '20px', opacity: 0.7 }}>🗑️</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Account deletion available</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Ratings and Reviews */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Ratings and reviews</h2>
            <div style={{ fontSize: '20px' }}>→</div>
          </div>
          
          <div className="flex-col-mobile" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1 }}>{displayRating}</div>
              <div style={{ color: 'var(--c1)', fontSize: '12px', marginTop: '4px' }}>★★★★★</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{reviewCountStr}</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[5,4,3,2,1].map(num => (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', width: '10px' }}>{num}</div>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: getRatingWidth(num), height: '100%', background: 'var(--c1)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* App Support (Developer Details) */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setSupportOpen(!supportOpen)}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>App support</h2>
            <div style={{ transform: supportOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', background: 'rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          
          {supportOpen && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Website */}
              {app.supportWebsite && (
                <a href={app.supportWebsite} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', color: '#fff', textDecoration: 'none' }}>
                  <div style={{ fontSize: '20px', opacity: 0.7 }}>🌐</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Website</div>
                  </div>
                </a>
              )}
              
              {/* Email */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '20px', opacity: 0.7 }}>✉️</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Email</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{app.supportEmail || developerInfo?.orgEmail || developerInfo?.email}</div>
                </div>
              </div>
              
              {/* Privacy Policy */}
              {app.privacyPolicy && (
                <a href={app.privacyPolicy} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', color: '#fff', textDecoration: 'none' }}>
                  <div style={{ fontSize: '20px', opacity: 0.7 }}>🛡️</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Privacy Policy</div>
                  </div>
                </a>
              )}
              
              {/* About the developer */}
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>About the developer</h3>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  {devDisplayName}<br/>
                  {developerInfo?.orgEmail || developerInfo?.email}<br/>
                  {developerInfo?.address && (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{developerInfo.address}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        </div>
      </div>
    </div>
  );
}

export default function AppDetailsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }}></div>}>
      <AppDetailsContent />
    </Suspense>
  );
}
