"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAppById, incrementAppDownloadCount, getReviewsForApp, Review, recordAppDownload, submitReview, hasUserDownloadedApp, deleteReview } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  
  const [supportOpen, setSupportOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleReviewSubmit = async () => {
    if (!user) {
      alert("Please log in to submit a review.");
      router.push('/login');
      return;
    }
    if (reviewRating === 0) {
      alert("Please select a rating.");
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview(app.id, user.uid, userData?.displayName || user.displayName || "Anonymous", reviewRating, reviewText);
      const revs = await getReviewsForApp(app.id);
      setReviews(revs);
      
      const updatedApp = await getAppById(app.id);
      if (updatedApp) {
        setApp(updatedApp);
      }
      
      setReviewModalOpen(false);
      setReviewRating(0);
      setReviewText("");
    } catch (e) {
      console.error(e);
      alert("Failed to submit review.");
    }
    setSubmittingReview(false);
  };

  useEffect(() => {
    async function checkDownload() {
      if (user && app) {
        const downloaded = await hasUserDownloadedApp(user.uid, app.id);
        setHasDownloaded(downloaded);
      }
    }
    checkDownload();
  }, [user, app]);

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
    
    if (app.status === 'paused') {
      alert("This app is currently paused and cannot be downloaded.");
      return;
    }

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
      const downloadFilename = `${app.appName.replace(/[^a-zA-Z0-9-_\.]/g, '_')}.apk`;
      const separator = app.apkUrl.includes('?') ? '&' : '?';
      link.href = `${app.apkUrl}${separator}download=${encodeURIComponent(downloadFilename)}`;
      link.setAttribute('download', downloadFilename);
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
      <div className="min-h-screen bg-surface flex flex-col">
        <Navigation />
        <div className="flex-1 flex justify-center items-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col justify-center items-center gap-6">
          <h1 className="font-display-lg text-3xl">App not found</h1>
          <button onClick={() => router.push('/')} className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors">
            Back to Store
          </button>
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
    <div className="min-h-screen bg-surface flex flex-col">
      <Navigation />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        
        {/* Optional App Banner */}
        {app.bannerUrl && (
          <div className="w-full flex justify-center mb-8">
            <img 
              src={app.bannerUrl} 
              alt={`${app.appName} Banner`} 
              className="w-full h-auto max-h-[300px] md:max-h-[400px] rounded-2xl md:rounded-3xl object-contain shadow-md bg-surface-container"
            />
          </div>
        )}

        {/* Play Store Style Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center mb-8">
          <img 
            src={app.iconUrl} 
            alt={app.appName} 
            className="w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover shadow-lg border border-outline-variant p-1 bg-surface-container"
          />
          <div className="flex-1">
            <h1 className="font-display-lg text-3xl md:text-5xl font-bold mb-2 text-on-surface">{app.appName}</h1>
            <div className="flex items-center gap-2 font-headline-sm text-primary mb-2">
              {devDisplayName}
              {developerInfo?.verified && (
                <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            {(app.containsAds || app.inAppPurchases) && (
              <div className="font-body-sm text-on-surface-variant mt-1">
                {[app.containsAds && 'Contains ads', app.inAppPurchases && 'In-app purchases'].filter(Boolean).join(' • ')}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 mb-10 pb-6 border-b border-outline-variant">
          <div className="flex flex-col items-center">
            <div className="font-headline-md text-on-surface font-bold flex items-center gap-1">
              {displayRating} <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div className="font-body-sm text-on-surface-variant">{reviewCountStr}</div>
          </div>
          <div className="w-[1px] h-8 bg-outline-variant hidden md:block"></div>
          <div className="flex flex-col items-center">
            <div className="font-headline-md text-on-surface font-bold bg-surface-variant px-2 rounded">{app.version || '1.0.0'}</div>
            <div className="font-body-sm text-on-surface-variant">Version</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="font-headline-md text-on-surface font-bold bg-surface-variant px-2 rounded">{app.ageRating || '3+'}</div>
            <div className="font-body-sm text-on-surface-variant">Rated for {app.ageRating || '3+'}</div>
          </div>
          <div className="w-[1px] h-8 bg-outline-variant hidden md:block"></div>
          <div className="flex flex-col items-center">
            <div className="font-headline-md text-on-surface font-bold">
              {app.downloads >= 1000000 ? (app.downloads/1000000).toFixed(1) + 'M+' : app.downloads >= 1000 ? (app.downloads/1000).toFixed(1) + 'k+' : app.downloads + '+'}
            </div>
            <div className="font-body-sm text-on-surface-variant">Downloads</div>
          </div>
        </div>

        {/* Install Button */}
        {app.status === 'paused' ? (
          <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6 mb-12 flex items-start gap-4">
            <span className="material-symbols-outlined text-yellow-600 mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <h3 className="font-headline-sm font-bold text-yellow-600 mb-1">Downloads Paused</h3>
              <p className="font-body-md text-on-surface-variant">This app currently pause due to technical app issue shortly it will displayed to you.</p>
            </div>
          </div>
        ) : (
          app.isPlayable ? (
            <a 
              href={`/play?id=${app.id}`}
              className={`w-full py-4 rounded-full font-label-lg flex items-center justify-center gap-2 mb-12 shadow-sm transition-colors bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Play Instantly
            </a>
          ) : (
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className={`w-full py-4 rounded-full font-label-lg flex items-center justify-center gap-2 mb-12 shadow-sm transition-colors ${downloading ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'}`}
            >
              {downloading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                  Downloading...
                </>
              ) : (
                'Download Now'
              )}
            </button>
          )
        )}

        {/* What's New */}
        {app.whatsNew && (
          <div className="mb-10">
            <h2 className="font-headline-md font-bold mb-4 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">new_releases</span>
              What's new
            </h2>
            <div className="font-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">
              {app.whatsNew}
            </div>
          </div>
        )}

        {/* About this app */}
        <div className="mb-10">
          <div 
            className="flex justify-between items-center cursor-pointer group mb-4"
            onClick={() => setAboutOpen(!aboutOpen)}
          >
            <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              About this {app.category?.toLowerCase() === 'games' ? 'game' : 'app'}
            </h2>
            <span className={`material-symbols-outlined transition-transform duration-300 text-on-surface-variant group-hover:text-primary ${aboutOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>

          {!developerInfo?.verified && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6 flex gap-4 items-start">
              <span className="material-symbols-outlined text-yellow-600" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <div>
                <strong className="block text-yellow-600 font-label-lg mb-1">This developer is not verified.</strong>
                <span className="text-on-surface-variant font-body-sm">Aero Store has not verified the identity or organization details of this developer. Please proceed with caution.</span>
              </div>
            </div>
          )}

          <div className="relative">
            <div className={`font-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed overflow-hidden transition-all duration-300 ${!aboutOpen && (app.description?.length > 150) ? 'max-h-[80px]' : 'max-h-[2000px]'}`}>
              {app.description}
            </div>
            {!aboutOpen && app.description && app.description.length > 150 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
            )}
          </div>
        </div>

        {/* Data Safety */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shield</span>
              Data safety
            </h2>
          </div>
          <p className="font-body-sm text-on-surface-variant mb-6 leading-relaxed max-w-3xl">
            Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region and age.
          </p>
          <div className="border border-outline-variant rounded-3xl p-6 bg-surface-container-lowest">
            {!app.dataCollected && !app.dataShared && !app.dataEncrypted && !app.accountDeletion ? (
              <div className="font-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined">help</span>
                No data safety information provided.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {app.dataShared && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">share</span>
                    <div className="font-body-md text-on-surface">This app may share data with third parties</div>
                  </div>
                )}
                {app.dataCollected && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">cloud_upload</span>
                    <div className="font-body-md text-on-surface">This app collects user data</div>
                  </div>
                )}
                {app.dataEncrypted && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">lock</span>
                    <div className="font-body-md text-on-surface">Data is encrypted in transit</div>
                  </div>
                )}
                {app.accountDeletion && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">delete_sweep</span>
                    <div className="font-body-md text-on-surface">Account deletion available</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ratings and Reviews */}
        <div className="mb-12">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">reviews</span>
              Ratings and reviews
            </h2>
            {!(user && reviews.some(r => r.userId === user.uid)) && (
              <button 
                onClick={() => {
                  if (!user) {
                    router.push('/login');
                  } else if (app?.status === 'paused') {
                    alert("This app is currently paused and cannot accept new reviews.");
                  } else if (!hasDownloaded) {
                    alert("You must download the app before you can review it.");
                  } else {
                    setReviewRating(0);
                    setReviewText('');
                    setReviewModalOpen(true);
                  }
                }} 
                className="font-label-lg font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-full transition-colors"
              >
                Write a review
              </button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-low p-8 rounded-3xl border border-outline-variant">
            <div className="text-center md:text-left min-w-[120px]">
              <div className="font-display-lg text-6xl font-bold text-on-surface mb-2">{displayRating}</div>
              <div className="flex items-center justify-center md:justify-start text-primary mb-1 text-sm">
                ★★★★★
              </div>
              <div className="font-body-sm text-on-surface-variant">{reviewCountStr}</div>
            </div>
            
            <div className="flex-1 flex flex-col gap-2 w-full">
              {[5,4,3,2,1].map(num => (
                <div key={num} className="flex items-center gap-4">
                  <div className="font-body-sm text-on-surface-variant w-4">{num}</div>
                  <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: getRatingWidth(num) }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Review List */}
          {reviews.length > 0 && (
            <div className="mt-8 flex flex-col gap-6">
              {/* User's Review */}
              {user && reviews.some(r => r.userId === user.uid) && (
                <div className="bg-primary-container/20 p-6 rounded-3xl border border-primary/30">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                        {userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-label-lg font-bold text-on-surface">Your Review</div>
                        <div className="flex items-center gap-2">
                          <div className="text-primary text-sm tracking-widest flex items-center">
                            {'★'.repeat(reviews.find(r => r.userId === user.uid)?.rating || 0)}{'☆'.repeat(5 - (reviews.find(r => r.userId === user.uid)?.rating || 0))}
                          </div>
                          <div className="font-body-sm text-on-surface-variant">
                            {reviews.find(r => r.userId === user.uid)?.createdAt?.toMillis ? new Date(reviews.find(r => r.userId === user.uid)!.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const r = reviews.find(r => r.userId === user.uid);
                          if (r) {
                            setReviewRating(r.rating);
                            setReviewText(r.text);
                            setReviewModalOpen(true);
                          }
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10"
                        title="Edit Review"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete your review?")) {
                            try {
                              const userReview = reviews.find(r => r.userId === user.uid);
                              if (userReview?.id) {
                                await deleteReview(userReview.id, app.id);
                                setReviews(prev => prev.filter(r => r.id !== userReview.id));
                                const updatedApp = await getAppById(app.id);
                                if (updatedApp) setApp(updatedApp);
                              }
                            } catch (e) {
                              console.error(e);
                              alert("Failed to delete review.");
                            }
                          }
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error/10"
                        title="Delete Review"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                  {reviews.find(r => r.userId === user.uid)?.text && <div className="font-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">{reviews.find(r => r.userId === user.uid)?.text}</div>}
                </div>
              )}

              {/* Other Reviews */}
              {reviews.filter(r => r.userId !== user?.uid).map((r, i) => (
                <div key={i} className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-outline-variant">
                      {r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-label-lg font-bold text-on-surface">{r.userName || "User"}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-primary text-sm tracking-widest flex items-center">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                        <div className="font-body-sm text-on-surface-variant">
                          {r.createdAt?.toMillis ? new Date(r.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {r.text && <div className="font-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">{r.text}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* App Support */}
        <div className="pt-8 border-t border-outline-variant">
          <div 
            className="flex justify-between items-center cursor-pointer group"
            onClick={() => setSupportOpen(!supportOpen)}
          >
            <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_support</span>
              App support
            </h2>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface-container transition-transform duration-300 group-hover:bg-surface-variant ${supportOpen ? 'rotate-180' : ''}`}>
              <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
            </div>
          </div>
          
          {supportOpen && (
            <div className="mt-8 flex flex-col gap-6 animate-fade-in pl-2">
              {app.supportWebsite && (
                <a href={app.supportWebsite} target="_blank" rel="noreferrer" className="flex gap-4 items-start group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">public</span>
                  <div>
                    <div className="font-label-lg text-on-surface mb-1 group-hover:text-primary transition-colors">Website</div>
                    <div className="font-body-sm text-primary underline truncate max-w-xs">{app.supportWebsite}</div>
                  </div>
                </a>
              )}
              
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                <div>
                  <div className="font-label-lg text-on-surface mb-1">Email</div>
                  <div className="font-body-sm text-on-surface-variant">{app.supportEmail || developerInfo?.orgEmail || developerInfo?.email}</div>
                </div>
              </div>
              
              {app.privacyPolicy && (
                <a href={app.privacyPolicy} target="_blank" rel="noreferrer" className="flex gap-4 items-start group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">policy</span>
                  <div>
                    <div className="font-label-lg text-on-surface mb-1 group-hover:text-primary transition-colors">Privacy Policy</div>
                  </div>
                </a>
              )}
              
              <div className="mt-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant">
                <h3 className="font-label-lg font-bold text-on-surface mb-3">About the developer</h3>
                <div className="font-body-sm text-on-surface-variant flex flex-col gap-1">
                  <span className="font-bold text-on-surface">{devDisplayName}</span>
                  <span>{developerInfo?.orgEmail || developerInfo?.email}</span>
                  {developerInfo?.address && (
                    <span className="whitespace-pre-wrap mt-2">{developerInfo.address}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Write Review Modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-low w-full max-w-md rounded-3xl border border-outline-variant p-6 flex flex-col shadow-2xl animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm font-bold text-on-surface">Write a Review</h3>
                <button onClick={() => setReviewModalOpen(false)} className="w-10 h-10 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-surface-container-highest">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-4xl hover:scale-110 transition-transform"
                  >
                    <span className={`material-symbols-outlined ${reviewRating >= star ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: reviewRating >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  </button>
                ))}
              </div>
              <textarea 
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Describe your experience (optional)"
                className="w-full h-32 p-4 bg-surface border border-outline-variant rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-on-surface mb-6"
              />
              <button 
                onClick={handleReviewSubmit}
                disabled={submittingReview || reviewRating === 0}
                className={`w-full py-3 rounded-full font-label-lg font-bold transition-colors flex items-center justify-center gap-2 ${submittingReview || reviewRating === 0 ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'}`}
              >
                {submittingReview ? <span className="material-symbols-outlined animate-spin">sync</span> : (reviews.some(r => r.userId === user?.uid) ? 'Update' : 'Submit')}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AppDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface"></div>}>
      <AppDetailsContent />
    </Suspense>
  );
}
