"use client";
import React, { useState, useEffect, Suspense } from 'react';
import Groq from 'groq-sdk';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAppFile, uploadAppBanner, UploadProgressEvent } from '@/lib/storage';
import { getAppById, updateAppListing, AppListing } from '@/lib/db';
import { useRouter, useSearchParams } from 'next/navigation';

const groq = new Groq({ 
  apiKey: 'proxy-key', 
  baseURL: process.env.NEXT_PUBLIC_AI_PROXY_URL || 'https://aero-ai-proxy.aerotechnologies-store.workers.dev',
  dangerouslyAllowBrowser: true 
});

function UpdateAppContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams.get('id');

  const [loadingApp, setLoadingApp] = useState(true);
  const [appData, setAppData] = useState<AppListing | null>(null);

  const [uploading, setUploading] = useState(false);
  const [version, setVersion] = useState('');
  const [whatsNew, setWhatsNew] = useState('');
  const [sourceType, setSourceType] = useState<'file' | 'url'>('file');
  const [sourceUrl, setSourceUrl] = useState('');
  const [apkFile, setApkFile] = useState<File | null>(null);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [ageRating, setAgeRating] = useState('3+');
  const [containsAds, setContainsAds] = useState(false);
  const [inAppPurchases, setInAppPurchases] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [progress, setProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState<UploadProgressEvent | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0 || !isFinite(seconds)) return 'Calculating...';
    if (seconds < 60) return `${Math.ceil(seconds)}s remaining`;
    const m = Math.floor(seconds / 60);
    const s = Math.ceil(seconds % 60);
    return `${m}m ${s}s remaining`;
  };

  useEffect(() => {
    async function loadApp() {
      if (!appId) {
        setError("No App ID provided.");
        setLoadingApp(false);
        return;
      }
      try {
        const data = await getAppById(appId);
        if (!data) {
          setError("App not found.");
        } else {
          setAppData(data);
          setVersion(data.version);
          setAgeRating(data.ageRating || '3+');
          setContainsAds(data.containsAds || false);
          setInAppPurchases(data.inAppPurchases || false);
          if (data.isPlayable) {
            setSourceType('url');
            setSourceUrl(data.apkUrl);
          }
        }
      } catch (err) {
        setError("Error loading app details.");
      } finally {
        setLoadingApp(false);
      }
    }
    loadApp();
  }, [appId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploading]);

  const handleAISuggest = async () => {
    if (!appData) return;
    setIsGeneratingAI(true);
    try {
      const prompt = `Analyze this app:
Name: ${appData.appName}
Description: ${appData.description}

Suggest the following properties in JSON format only:
{
  "ageRating": "3+" | "7+" | "12+" | "16+" | "18+",
  "containsAds": boolean,
  "inAppPurchases": boolean
}
Output nothing but the JSON.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content?.trim() || "{}";
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        if (data.ageRating) setAgeRating(data.ageRating);
        if (typeof data.containsAds === 'boolean') setContainsAds(data.containsAds);
        if (typeof data.inAppPurchases === 'boolean') setInAppPurchases(data.inAppPurchases);
        alert("✨ AI successfully filled the metadata based on your app description!");
      } else {
        alert("AI could not generate a valid response. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("AI Suggestion failed.");
    }
    setIsGeneratingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("You must be logged in.");
    if (!appData) return;
    if (appData.developerId !== user.uid) return setError("Unauthorized.");
    
    if (!version) return setError("Please enter the new version number.");
    if (sourceType === 'file' && !apkFile) return setError("Please upload the new APK file.");
    if (sourceType === 'url' && !sourceUrl) return setError("Please provide the new download URL.");

    if (sourceType === 'file' && apkFile) {
      if (!apkFile.name.toLowerCase().endsWith('.apk')) {
        return setError("Invalid file format. You can only upload valid Android .apk files.");
      }
    }

    setError('');
    setUploading(true);
    setProgress(10);

    try {
      let finalApkUrl = sourceUrl;

      if (sourceType === 'file' && apkFile) {
        finalApkUrl = await uploadAppFile(apkFile, user.uid, appData.appName, (event) => {
          setUploadStats(event);
          setProgress(10 + (event.progress * 0.8));
        });
      }

      setUploadStats(null);
      let newBannerUrl = appData.bannerUrl;
      if (bannerFile) {
        newBannerUrl = await uploadAppBanner(bannerFile, user.uid, appData.appName, (event) => {
           setUploadStats(event);
        });
      }

      setProgress(95);
      
      await updateAppListing(appData.id, {
        version,
        whatsNew,
        apkUrl: finalApkUrl,
        bannerUrl: newBannerUrl,
        ageRating,
        containsAds,
        inAppPurchases
      });
      
      setProgress(100);
      setSuccess(true);
      
      setTimeout(() => router.push('/dashboard/apps'), 2000);

    } catch (err: any) {
      console.error("Update Error:", err);
      setError("An error occurred during update. Please try again.");
    } finally {
      if (!success) setUploading(false);
    }
  };

  if (loadingApp) return <div className="p-10 text-on-surface">Loading app details...</div>;

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-2 text-on-surface">Update App: {appData?.appName}</h1>
      <p className="text-on-surface-variant mb-8">Release a new version of your app to your users.</p>

      {error && <div className="bg-error-container/20 text-error p-4 rounded-xl mb-6 border border-error-container/30">{error}</div>}
      
      {success ? (
        <div className="bg-surface-container border border-success-green/30 p-8 text-center rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-success-green mb-2">Update Published!</h2>
          <p className="text-on-surface-variant">Your app has been successfully updated. Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface-container border border-outline-variant p-8 rounded-2xl shadow-sm flex flex-col gap-6">
          
          <div>
            <label className="block mb-2 text-sm font-semibold text-on-surface">New Version (Current: {appData?.version})</label>
            <input aria-label="Version Field" 
              type="text" 
              placeholder="e.g. 1.0.1" 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              disabled={uploading}
              required
              className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-on-surface">What's New in this Update? (Optional)</label>
            <textarea aria-label="Whats New Field" 
              placeholder="- Bug fixes and performance improvements&#10;- New dark mode support" 
              value={whatsNew}
              onChange={(e) => setWhatsNew(e.target.value)}
              disabled={uploading}
              rows={5}
              className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
            />
          </div>

          <hr className="border-outline-variant my-2" />

          <div>
            {appData?.isPlayable ? (
              <div>
                <label className="block mb-2 text-sm font-semibold text-on-surface">Game URL (Instant Web Game)</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://game-url.com" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} disabled={uploading} required className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button type="button" onClick={() => setSourceType('file')} className={`flex-1 p-3 rounded-lg font-semibold border transition-colors ${sourceType === 'file' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-outline hover:border-primary'}`}>Upload New APK</button>
                  <button type="button" onClick={() => setSourceType('url')} className={`flex-1 p-3 rounded-lg font-semibold border transition-colors ${sourceType === 'url' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-outline hover:border-primary'}`}>External URL (GitHub)</button>
                </div>

                {sourceType === 'file' ? (
                  <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${apkFile ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}>
                    <div className="text-4xl mb-4">📦</div>
                    {apkFile ? (
                      <p className="text-primary font-semibold mb-4">{apkFile.name} ({(apkFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                    ) : (
                      <p className="text-on-surface-variant mb-4">Click to browse and upload the updated .apk file</p>
                    )}
                    <input aria-label="Upload Form Field" type="file" accept=".apk" onChange={(e) => setApkFile(e.target.files?.[0] || null)} disabled={uploading} className="block mx-auto text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container hover:file:text-on-primary-container" required={sourceType === 'file'} />
                  </div>
                ) : (
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-on-surface">Direct Download URL</label>
                    <input aria-label="Upload Form Field" type="url" placeholder="https://github.com/user/repo/releases/download/v2.0/app.apk" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} disabled={uploading} required={sourceType === 'url'} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                  </div>
                )}
              </>
            )}
          </div>

          <hr className="border-outline-variant my-2" />

          <div>
            <label className="block mb-2 text-sm font-semibold text-on-surface">App Feature Banner (Optional - 1024x500 recommended)</label>
            <input aria-label="Upload Form Field" 
              type="file" 
              accept="image/*" 
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              disabled={uploading}
              className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-on-secondary hover:file:bg-secondary-container hover:file:text-on-secondary-container"
            />
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm font-bold text-on-surface">App Metadata</h3>
              <button 
                type="button" 
                onClick={handleAISuggest}
                disabled={isGeneratingAI || uploading}
                className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary/20 disabled:opacity-50 transition-colors"
              >
                {isGeneratingAI ? "✨ Analyzing..." : "✨ AI Suggest Metadata"}
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-on-surface">Content Rating</label>
                <select 
                  value={ageRating}
                  onChange={(e) => setAgeRating(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary"
                >
                  <option value="3+">Rated for 3+</option>
                  <option value="7+">Rated for 7+</option>
                  <option value="12+">Rated for 12+</option>
                  <option value="16+">Rated for 16+</option>
                  <option value="18+">Rated for 18+</option>
                </select>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 font-semibold text-on-surface cursor-pointer">
                  <input type="checkbox" checked={containsAds} onChange={(e) => setContainsAds(e.target.checked)} disabled={uploading} className="w-5 h-5 accent-primary" />
                  Contains Ads
                </label>
                <label className="flex items-center gap-2 font-semibold text-on-surface cursor-pointer">
                  <input type="checkbox" checked={inAppPurchases} onChange={(e) => setInAppPurchases(e.target.checked)} disabled={uploading} className="w-5 h-5 accent-primary" />
                  In-App Purchases
                </label>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="mt-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="text-sm font-bold text-primary block">Uploading Update...</span>
                  {uploadStats && uploadStats.total > 0 && (
                    <span className="text-xs text-on-surface-variant font-mono mt-1 block">
                      {formatBytes(uploadStats.loaded)} / {formatBytes(uploadStats.total)} • {formatBytes(uploadStats.speed)}/s
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-primary block">
                    {uploadStats && uploadStats.total > 0 ? uploadStats.progress : Math.round(progress)}%
                  </span>
                  {uploadStats && uploadStats.speed > 0 && uploadStats.progress < 100 && (
                    <span className="text-xs text-on-surface-variant mt-1 block">
                      {formatTime(uploadStats.timeRemaining)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-primary transition-all duration-300 relative overflow-hidden" style={{ width: `${uploadStats && uploadStats.total > 0 ? uploadStats.progress : progress}%` }}>
                  <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem', animation: 'progress-stripes 1s linear infinite' }}></div>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading}
            className="mt-4 w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {uploading ? "Publishing Update..." : "Publish Update"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function UpdateAppPage() {
  return (
    <Suspense fallback={<div className="p-10 text-on-surface">Loading...</div>}>
      <UpdateAppContent />
    </Suspense>
  );
}
