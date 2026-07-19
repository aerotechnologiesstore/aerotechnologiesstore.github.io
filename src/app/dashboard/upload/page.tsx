"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAppFile, uploadAppIcon, submitAppListing } from '@/lib/storage';
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

  const [supportWebsite, setSupportWebsite] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  
  const [dataCollected, setDataCollected] = useState(false);
  const [dataShared, setDataShared] = useState(false);
  const [dataEncrypted, setDataEncrypted] = useState(false);
  const [accountDeletion, setAccountDeletion] = useState(false);

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("You must be logged in as a developer.");
    if (!appName || !description || !iconFile) {
      return setError("Please fill out all basic fields and upload an Icon.");
    }
    if (sourceType === 'file' && !apkFile) return setError("Please upload the APK file.");
    if (sourceType === 'url' && !sourceUrl) return setError("Please provide the external download URL.");

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
      // 1. Upload Icon using Cloudinary
      const iconUrl = await uploadAppIcon(iconFile, user.uid, appName, (p) => {
        setProgress(10 + (p * (sourceType === 'file' ? 0.2 : 0.8)));
      });

      let finalApkUrl = sourceUrl;

      // 2. Upload APK if file using Cloudinary
      if (sourceType === 'file' && apkFile) {
        finalApkUrl = await uploadAppFile(apkFile, user.uid, appName, (p) => {
          setProgress(30 + (p * 0.6));
        });
      }

      let scheduledTimestamp = null;
      if (scheduledForDate && scheduledForTime) {
        scheduledTimestamp = new Date(`${scheduledForDate}T${scheduledForTime}`).getTime();
      }

      // 3. Submit metadata
      setProgress(95);
      await submitAppListing(user.uid, appName, description, category, version, finalApkUrl, iconUrl, sourceType, scheduledTimestamp, supportWebsite, supportEmail, privacyPolicy, dataCollected, dataShared, dataEncrypted, accountDeletion);
      
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
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Upload New App</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Fill out the details below to publish your app to the store.</p>

      <div style={{ background: 'rgba(0,163,255,0.1)', color: '#00A3FF', padding: '16px', borderRadius: '12px', marginBottom: '32px', border: '1px solid rgba(0,163,255,0.3)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <div>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Storage Guidelines & Limits</strong>
          <span style={{ fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>
            The free tier allows up to <strong>100MB per APK</strong>. For larger applications or enterprise storage needs, additional charges may apply based on server costs. Please ensure your files are optimized before uploading.
          </span>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,77,77,0.3)' }}>{error}</div>}
      
      {success ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(0,255,163,0.3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ marginBottom: '8px' }}>App Uploaded Successfully!</h2>
          <p>Your app has been submitted for review. Redirecting to dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>App Name</label>
            <input aria-label="Upload Form Field" 
              type="text" 
              placeholder="e.g. Super Racing 3D" 
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              disabled={uploading}
              required
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Short Description</label>
            <textarea aria-label="Upload Form Field" 
              placeholder="What does your app do?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              required
              rows={4}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Category</label>
              <select aria-label="Upload Form Field" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }}
              >
                <option value="Games">Games</option>
                <option value="Social">Social</option>
                <option value="Productivity">Productivity</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Version</label>
              <input aria-label="Upload Form Field" 
                type="text" 
                placeholder="1.0.0" 
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={uploading}
                required
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          <div>
            <div className="flex-col-mobile" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <button type="button" onClick={() => setSourceType('file')} style={{ flex: 1, padding: '12px', background: sourceType === 'file' ? 'var(--c2)' : 'transparent', color: sourceType === 'file' ? '#fff' : 'rgba(255,255,255,0.6)', border: `1px solid ${sourceType === 'file' ? 'var(--c2)' : 'var(--border)'}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Upload APK File</button>
              <button type="button" onClick={() => setSourceType('url')} style={{ flex: 1, padding: '12px', background: sourceType === 'url' ? 'var(--c2)' : 'transparent', color: sourceType === 'url' ? '#fff' : 'rgba(255,255,255,0.6)', border: `1px solid ${sourceType === 'url' ? 'var(--c2)' : 'var(--border)'}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>External URL (GitHub)</button>
            </div>

            {sourceType === 'file' ? (
              <div style={{ border: `2px dashed ${apkFile ? 'var(--c2)' : 'var(--border)'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', transition: 'border-color 0.3s' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
                {apkFile ? (
                  <p style={{ color: 'var(--c3)', fontWeight: 600, marginBottom: '16px' }}>{apkFile.name} ({(apkFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Click to browse and upload your .apk file</p>
                )}
                <input aria-label="Upload Form Field" type="file" accept=".apk" onChange={(e) => setApkFile(e.target.files?.[0] || null)} disabled={uploading} style={{ display: 'block', margin: '0 auto', color: 'rgba(255,255,255,0.6)' }} required={sourceType === 'file'} />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Direct Download URL</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://github.com/user/repo/releases/download/v1.0/app.apk" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} disabled={uploading} required={sourceType === 'url'} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>App Icon (512x512 recommended)</label>
            <input aria-label="Upload Form Field" 
              type="file" 
              accept="image/*" 
              onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              disabled={uploading}
              required
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>App Support Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Support Email</label>
                <input aria-label="Upload Form Field" type="email" placeholder="support@mycompany.com" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} disabled={uploading} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Website URL (Optional)</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://mycompany.com" value={supportWebsite} onChange={(e) => setSupportWebsite(e.target.value)} disabled={uploading} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Privacy Policy URL</label>
                <input aria-label="Upload Form Field" type="url" placeholder="https://mycompany.com/privacy" value={privacyPolicy} onChange={(e) => setPrivacyPolicy(e.target.value)} disabled={uploading} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Data Safety</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={dataCollected} onChange={(e) => setDataCollected(e.target.checked)} disabled={uploading} style={{ width: '20px', height: '20px' }} />
                <span>This app collects user data (e.g. Activity, Financial Info)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={dataShared} onChange={(e) => setDataShared(e.target.checked)} disabled={uploading} style={{ width: '20px', height: '20px' }} />
                <span>This app shares data with third parties</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={dataEncrypted} onChange={(e) => setDataEncrypted(e.target.checked)} disabled={uploading} style={{ width: '20px', height: '20px' }} />
                <span>Data is encrypted in transit</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={accountDeletion} onChange={(e) => setAccountDeletion(e.target.checked)} disabled={uploading} style={{ width: '20px', height: '20px' }} />
                <span>Account deletion is available</span>
              </label>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Schedule Publishing (Optional)</label>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '12px' }}>Leave blank to publish immediately after admin approval.</p>
            <div className="flex-col-mobile" style={{ display: 'flex', gap: '16px' }}>
              <input aria-label="Upload Form Field" type="date" value={scheduledForDate} onChange={(e) => setScheduledForDate(e.target.value)} disabled={uploading} style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              <input aria-label="Upload Form Field" type="time" value={scheduledForTime} onChange={(e) => setScheduledForTime(e.target.value)} disabled={uploading} style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
            </div>
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
            className="btn-glass btn-glass-primary"
            style={{ marginTop: '16px', padding: '16px', fontSize: '16px' }}
          >
            {uploading ? "Publishing App..." : "Submit App for Review"}
          </button>

        </form>
      )}
    </div>
  );
}
