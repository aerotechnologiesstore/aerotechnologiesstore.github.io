"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAppFile, uploadAppIcon, uploadAppBanner, submitAppListing, UploadProgressEvent } from '@/lib/storage';
import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: 'proxy-key', 
  baseURL: process.env.NEXT_PUBLIC_AI_PROXY_URL || 'https://aero-ai-proxy.aerotechnologies-store.workers.dev',
  dangerouslyAllowBrowser: true 
});
import { getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UploadAppPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploading]);

  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Games');
  const [version, setVersion] = useState('1.0.0');

  const [sourceType, setSourceType] = useState<'file' | 'url'>('file');
  const [sourceUrl, setSourceUrl] = useState('');
  const [scheduledForDate, setScheduledForDate] = useState('');
  const [scheduledForTime, setScheduledForTime] = useState('');

  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [ageRating, setAgeRating] = useState('3+');
  const [containsAds, setContainsAds] = useState(false);
  const [inAppPurchases, setInAppPurchases] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [supportWebsite, setSupportWebsite] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  
  const [dataCollected, setDataCollected] = useState(false);
  const [dataShared, setDataShared] = useState(false);
  const [dataEncrypted, setDataEncrypted] = useState(false);
  const [accountDeletion, setAccountDeletion] = useState(false);

  const [isPlayable, setIsPlayable] = useState(false);
  const [playableUrl, setPlayableUrl] = useState('');

  const [progress, setProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState<UploadProgressEvent | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [scanResult, setScanResult] = useState<'clean' | 'suspicious' | null>(null);

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

  const handleAISuggest = async () => {
    if (!appName || !description) {
      alert("Please fill in the App Name and Short Description first so the AI has context.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const prompt = `Analyze this app:
Name: ${appName}
Description: ${description}

Suggest the following properties in JSON format only:
{
  "ageRating": "3+" | "7+" | "12+" | "16+" | "18+",
  "containsAds": boolean,
  "inAppPurchases": boolean,
  "category": "Games" | "Social" | "Productivity" | "Education" | "Finance" | "Entertainment"
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
        if (data.category) setCategory(data.category);
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
    if (!user) return setError("You must be logged in as a developer.");
    if (!appName || !description || !iconFile) {
      return setError("Please fill out all basic fields and upload an Icon.");
    }
    if (isPlayable) {
      if (!playableUrl) return setError("Please provide the Playable Game URL.");
    } else {
      if (sourceType === 'file' && !apkFile) return setError("Please upload the APK file.");
      if (sourceType === 'url' && !sourceUrl) return setError("Please provide the external download URL.");
    }

    // STRICT FILE VALIDATION
    if (iconFile && !iconFile.type.startsWith('image/')) {
      return setError("App Icon must be a valid image file.");
    }
    if (sourceType === 'file' && apkFile) {
      if (!apkFile.name.toLowerCase().endsWith('.apk')) {
        return setError("Invalid file format. You can only upload valid Android .apk files.");
      }
    }

    setError('');
    setUploading(true);
    setProgress(10);

    try {
      // 1. Upload Icon
      const iconUrl = await uploadAppIcon(iconFile, user.uid, appName, (event) => {
        setUploadStats(event);
        setProgress(10 + (event.progress * (sourceType === 'file' ? 0.2 : 0.8)));
      });

      let finalApkUrl = sourceUrl;

      // 2. Upload APK if file (Skip if Playable)
      if (!isPlayable && sourceType === 'file' && apkFile) {
        finalApkUrl = await uploadAppFile(apkFile, user.uid, appName, (event) => {
          setUploadStats(event);
          setProgress(30 + (event.progress * 0.6));
        });
      }

      setUploadStats(null);
      
      let bannerUrl = null;
      if (bannerFile) {
        bannerUrl = await uploadAppBanner(bannerFile, user.uid, appName, (event) => {
           setUploadStats(event);
        });
      }

      setProgress(95);

      // Automated AI Virus Scan Heuristic
      const suspiciousKeywords = ['hack', 'cheat', 'crack', 'mod', 'free money', 'gambling', 'casino', 'nulled', 'spy', 'tracker'];
      const textToScan = `${appName.toLowerCase()} ${description.toLowerCase()}`;
      const isSuspicious = suspiciousKeywords.some(keyword => textToScan.includes(keyword));

      const virusScanStatus = isSuspicious ? 'suspicious' : 'clean';
      const finalStatus = isSuspicious ? 'pending_review' : 'scheduled';
      const publishDate = isSuspicious ? null : Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      setScanResult(virusScanStatus);

      // 4. Save to Database
      await submitAppListing(
        user.uid,
        appName,
        description,
        category,
        version,
        finalApkUrl,
        iconUrl,
        sourceType,
        scheduledForDate && scheduledForTime ? new Date(`${scheduledForDate}T${scheduledForTime}`).getTime() : null,
        supportWebsite,
        supportEmail,
        privacyPolicy,
        dataCollected,
        dataShared,
        dataEncrypted,
        accountDeletion,
        bannerUrl || undefined,
        ageRating,
        containsAds,
        inAppPurchases,
        virusScanStatus,
        finalStatus,
        publishDate,
        isPlayable,
        playableUrl
      );
      
      setProgress(100);
      setSuccess(true);
      
      setTimeout(() => router.push('/dashboard/'), 2000);

    } catch (err: any) {
      console.error("Upload Error:", err);
      setError("An error occurred during upload. Please try again. " + (err.message || ''));
    } finally {
      if (!success) setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-2 text-on-surface">Upload New App</h1>
      <p className="text-on-surface-variant mb-6">Fill out the details below to publish your app to the store.</p>

      {error && <div className="bg-error-container/20 text-error p-4 rounded-xl mb-6 border border-error-container/30">{error}</div>}
      
      {success ? (
        <div className="bg-surface-container border border-outline-variant p-8 text-center rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">App Uploaded Successfully!</h2>
          <p className="text-on-surface-variant mb-6">Your app has gone for inspection.</p>
          
          {scanResult === 'clean' ? (
             <div className="bg-success-container/10 text-success p-4 rounded-xl border border-success-container/30 inline-block text-left">
               <strong className="block mb-1">✅ Automated Scan: Clean</strong>
               <p className="text-sm">No suspicious elements found. Your app is scheduled to be automatically published to the store in 24 hours.</p>
             </div>
          ) : (
             <div className="bg-warning-container/10 text-warning p-4 rounded-xl border border-warning-container/30 inline-block text-left">
               <strong className="block mb-1">⚠️ Automated Scan: Flagged</strong>
               <p className="text-sm">Our automated system flagged this app for manual review. An Admin must approve it before it goes live.</p>
             </div>
          )}
          <p className="text-sm text-on-surface-variant mt-6">Redirecting to dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface-container border border-outline-variant p-8 rounded-2xl shadow-sm flex flex-col gap-6">
          
          <div>
            <label className="block mb-2 text-sm font-semibold text-on-surface">App Name</label>
            <input aria-label="Upload Form Field" 
              type="text" 
              placeholder="e.g. Super Racing 3D" 
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              disabled={uploading}
              required
              className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-on-surface">Short Description</label>
            <textarea aria-label="Upload Form Field" 
              placeholder="What does your app do?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              required
              rows={4}
              className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
            />
          </div>

          <div className="flex gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2 text-sm font-semibold text-on-surface">Category</label>
              <select aria-label="Upload Form Field" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
                className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              >
                <option value="Games">Games</option>
                <option value="Social">Social</option>
                <option value="Productivity">Productivity</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2 text-sm font-semibold text-on-surface">Version</label>
              <input aria-label="Upload Form Field" 
                type="text" 
                placeholder="1.0.0" 
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={uploading}
                required
                className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
               <hr className="border-outline-variant my-2" />

          <div>
            <div className="flex flex-col mb-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-outline rounded-xl hover:bg-surface-container-low transition-colors">
                <input type="checkbox" checked={isPlayable} onChange={(e) => setIsPlayable(e.target.checked)} className="w-5 h-5 text-primary rounded bg-surface border-outline focus:ring-primary focus:ring-2 cursor-pointer" />
                <div>
                  <div className="font-bold text-on-surface">Is this an Instant Web Game (Playable)?</div>
                  <div className="text-sm text-on-surface-variant">Users can play HTML5 games directly in the browser without downloading an APK.</div>
                </div>
              </label>
            </div>

            {isPlayable ? (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block mb-2 text-sm font-semibold text-on-surface">Playable Game URL (HTML5 Web Game Link)</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://mygame.vercel.app" value={playableUrl} onChange={(e) => setPlayableUrl(e.target.value)} disabled={uploading} required={isPlayable} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                <p className="mt-2 text-xs text-on-surface-variant">Host your HTML5 game on Vercel, Firebase Hosting, or GitHub Pages and paste the direct link here.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button type="button" onClick={() => setSourceType('file')} className={`flex-1 p-3 rounded-lg font-semibold border transition-colors ${sourceType === 'file' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-outline hover:border-primary'}`}>Upload APK File</button>
                  <button type="button" onClick={() => setSourceType('url')} className={`flex-1 p-3 rounded-lg font-semibold border transition-colors ${sourceType === 'url' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-outline hover:border-primary'}`}>External URL (GitHub)</button>
                </div>

                {sourceType === 'file' ? (
                  <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${apkFile ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}>
                    <div className="text-4xl mb-4">📱</div>
                    {apkFile ? (
                      <p className="text-primary font-semibold mb-4">{apkFile.name} ({(apkFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                    ) : (
                      <p className="text-on-surface-variant mb-4">Click to browse and upload your .apk file</p>
                    )}
                    <input aria-label="Upload Form Field" type="file" accept=".apk" onChange={(e) => setApkFile(e.target.files?.[0] || null)} disabled={uploading} className="block mx-auto text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container hover:file:text-on-primary-container" required={sourceType === 'file'} />
                  </div>
                ) : (
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-on-surface">Direct Download URL</label>
                    <input aria-label="Upload Form Field" type="url" placeholder="https://github.com/user/repo/releases/download/v1.0/app.apk" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} disabled={uploading} required={sourceType === 'url'} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                  </div>
                )}
              </div>
            )}
          </div>          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-on-surface">App Icon (512x512 recommended) *</label>
            <input aria-label="Upload Form Field" 
              type="file" 
              accept="image/*" 
              onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              disabled={uploading}
              required
              className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container hover:file:text-on-primary-container"
            />
          </div>

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

          <hr className="border-outline-variant my-2" />

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

          <hr className="border-outline-variant my-2" />

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-4">App Support Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-on-surface">Support Email</label>
                <input aria-label="Upload Form Field" type="email" placeholder="support@mycompany.com" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} disabled={uploading} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-on-surface">Website URL (Optional)</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://mycompany.com" value={supportWebsite} onChange={(e) => setSupportWebsite(e.target.value)} disabled={uploading} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-on-surface">Privacy Policy URL</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://mycompany.com/privacy" value={privacyPolicy} onChange={(e) => setPrivacyPolicy(e.target.value)} disabled={uploading} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
              </div>
            </div>
          </div>

          <hr className="border-outline-variant my-2" />

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-4">Data Safety</h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer text-on-surface">
                <input type="checkbox" checked={dataCollected} onChange={(e) => setDataCollected(e.target.checked)} disabled={uploading} className="w-5 h-5 accent-primary rounded" />
                <span>This app collects user data (e.g. Activity, Financial Info)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-on-surface">
                <input type="checkbox" checked={dataShared} onChange={(e) => setDataShared(e.target.checked)} disabled={uploading} className="w-5 h-5 accent-primary rounded" />
                <span>This app shares data with third parties</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-on-surface">
                <input type="checkbox" checked={dataEncrypted} onChange={(e) => setDataEncrypted(e.target.checked)} disabled={uploading} className="w-5 h-5 accent-primary rounded" />
                <span>Data is encrypted in transit</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-on-surface">
                <input type="checkbox" checked={accountDeletion} onChange={(e) => setAccountDeletion(e.target.checked)} disabled={uploading} className="w-5 h-5 accent-primary rounded" />
                <span>Account deletion is available</span>
              </label>
            </div>
          </div>

          <hr className="border-outline-variant my-2" />

          <div>
            <label className="block mb-2 text-sm font-semibold text-on-surface">Schedule Publishing (Optional)</label>
            <p className="text-sm text-on-surface-variant mb-3">Leave blank to publish immediately after admin approval.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input aria-label="Upload Form Field" type="date" value={scheduledForDate} onChange={(e) => setScheduledForDate(e.target.value)} disabled={uploading} className="flex-1 px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
              <input aria-label="Upload Form Field" type="time" value={scheduledForTime} onChange={(e) => setScheduledForTime(e.target.value)} disabled={uploading} className="flex-1 px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
            </div>
          </div>

          {uploading && (
            <div className="mt-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="text-sm font-bold text-primary block">Uploading to Aero Store...</span>
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
            {uploading ? "Publishing App..." : "Submit App for Review"}
          </button>

        </form>
      )}
    </div>
  );
}
