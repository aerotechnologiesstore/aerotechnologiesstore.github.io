"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAppFile } from '@/lib/storage';
import { getAppById, updateAppListing, AppListing } from '@/lib/db';
import { useRouter, useSearchParams } from 'next/navigation';

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

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
        finalApkUrl = await uploadAppFile(apkFile, user.uid, appData.appName, (p) => {
          setProgress(10 + (p * 0.8));
        });
      }

      setProgress(95);
      
      await updateAppListing(appData.id, {
        version,
        whatsNew,
        apkUrl: finalApkUrl
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

  if (loadingApp) return <div style={{ padding: '40px', color: '#fff' }}>Loading app details...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Update App: {appData?.appName}</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Release a new version of your app to your users.</p>

      {error && <div style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,77,77,0.3)' }}>{error}</div>}
      
      {success ? (
        <div style={{ background: 'rgba(0,255,163,0.1)', color: '#00ffa3', padding: '32px', borderRadius: '16px', border: '1px solid rgba(0,255,163,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ marginBottom: '8px' }}>Update Published!</h2>
          <p>Your app has been successfully updated. Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>New Version (Current: {appData?.version})</label>
            <input aria-label="Version Field" 
              type="text" 
              placeholder="e.g. 1.0.1" 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              disabled={uploading}
              required
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>What's New in this Update? (Optional)</label>
            <textarea aria-label="Whats New Field" 
              placeholder="- Bug fixes and performance improvements&#10;- New dark mode support" 
              value={whatsNew}
              onChange={(e) => setWhatsNew(e.target.value)}
              disabled={uploading}
              rows={5}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px', resize: 'vertical' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <button type="button" onClick={() => setSourceType('file')} style={{ flex: 1, padding: '12px', background: sourceType === 'file' ? 'var(--c2)' : 'transparent', color: sourceType === 'file' ? '#fff' : 'rgba(255,255,255,0.6)', border: `1px solid ${sourceType === 'file' ? 'var(--c2)' : 'var(--border)'}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Upload New APK</button>
              <button type="button" onClick={() => setSourceType('url')} style={{ flex: 1, padding: '12px', background: sourceType === 'url' ? 'var(--c2)' : 'transparent', color: sourceType === 'url' ? '#fff' : 'rgba(255,255,255,0.6)', border: `1px solid ${sourceType === 'url' ? 'var(--c2)' : 'var(--border)'}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>External URL (GitHub)</button>
            </div>

            {sourceType === 'file' ? (
              <div style={{ border: `2px dashed ${apkFile ? 'var(--c2)' : 'var(--border)'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', transition: 'border-color 0.3s' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
                {apkFile ? (
                  <p style={{ color: 'var(--c3)', fontWeight: 600, marginBottom: '16px' }}>{apkFile.name} ({(apkFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Click to browse and upload the updated .apk file</p>
                )}
                <input aria-label="Upload Form Field" type="file" accept=".apk" onChange={(e) => setApkFile(e.target.files?.[0] || null)} disabled={uploading} style={{ display: 'block', margin: '0 auto', color: 'rgba(255,255,255,0.6)' }} required={sourceType === 'file'} />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Direct Download URL</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://github.com/user/repo/releases/download/v2.0/app.apk" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} disabled={uploading} required={sourceType === 'url'} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              </div>
            )}
          </div>

          {uploading && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--c2)' }}>
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--c1), var(--c2))', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading}
            style={{ marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, var(--c1), var(--c2))', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
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
    <Suspense fallback={<div style={{ padding: '40px', color: '#fff' }}>Loading...</div>}>
      <UpdateAppContent />
    </Suspense>
  );
}
