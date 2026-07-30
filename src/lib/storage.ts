import { updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { supabase } from './supabase';

const BUCKET_NAME = 'aero store';

export interface UploadProgressEvent {
  progress: number;
  loaded: number;
  total: number;
  speed: number;
  timeRemaining: number;
}

/**
 * Upload a file to Archive.org via the Cloudflare Worker proxy.
 * ALL files (APKs, icons, banners, documents) go through this single storage engine.
 */
async function uploadToArchiveOrg(
  file: File,
  identifier: string,
  filename: string,
  title: string,
  onProgress?: (event: UploadProgressEvent) => void
): Promise<string> {
  const workerUrl = process.env.NEXT_PUBLIC_ARCHIVE_ORG_WORKER_URL || '';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const endpoint = `${workerUrl}/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;

    xhr.open('PUT', endpoint, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-archive-meta-mediatype', 'software');
    xhr.setRequestHeader('x-archive-meta-title', title);
    xhr.setRequestHeader('x-archive-meta-description', `${title} - Distributed via Aero Store`);

    const startTime = Date.now();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const now = Date.now();
        const timeElapsed = (now - startTime) / 1000;
        const speed = timeElapsed > 0 ? e.loaded / timeElapsed : 0;
        const timeRemaining = speed > 0 ? (e.total - e.loaded) / speed : 0;
        const progress = Math.min(100, Math.round((e.loaded / e.total) * 100));

        onProgress({ progress, loaded: e.loaded, total: e.total, speed, timeRemaining });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) {
          onProgress({ progress: 100, loaded: file.size, total: file.size, speed: 0, timeRemaining: 0 });
        }
        const downloadUrl = `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;
        resolve(downloadUrl);
      } else {
        console.error("Archive.org Upload Error:", xhr.status, xhr.responseText);
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      console.error("Network Error during upload");
      reject(new Error('Network Error during upload'));
    };

    xhr.send(file);
  });
}

/**
 * Helper: Generate a unique Archive.org identifier and filename
 */
function makeArchiveId(prefix: string, developerId: string, name: string) {
  const timestamp = Date.now();
  const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  const identifier = `aero-store-${prefix}-${sanitized}-${timestamp}`;
  return { identifier, timestamp, sanitized };
}

/**
 * Helper to delete a file from Supabase using its public URL (legacy cleanup)
 */
export async function deleteFromSupabase(publicUrl: string): Promise<void> {
  try {
    const BUCKET = 'aero store';
    const parts = publicUrl.split(`/public/${encodeURIComponent(BUCKET)}/`);
    if (parts.length === 2) {
      const path = parts[1];
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) console.error("Supabase Delete Error:", error);
    } else {
      const partsUnencoded = publicUrl.split(`/public/${BUCKET}/`);
      if (partsUnencoded.length === 2) {
        const path = partsUnencoded[1];
        const { error } = await supabase.storage.from(BUCKET).remove([path]);
        if (error) console.error("Supabase Delete Error:", error);
      }
    }
  } catch (err) {
    console.error("Failed to delete from Supabase:", err);
  }
}

/**
 * Uploads media to Supabase Storage (Icons, Banners, Photos)
 */
async function uploadMediaToSupabase(file: File, folder: string, onProgress?: (event: UploadProgressEvent) => void): Promise<string> {
  const filePath = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  if (onProgress) onProgress({ progress: 50, loaded: file.size / 2, total: file.size, speed: 0, timeRemaining: 0 });

  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw new Error(`Upload Failed: ${error.message}`);
  }
  
  if (onProgress) onProgress({ progress: 100, loaded: file.size, total: file.size, speed: 0, timeRemaining: 0 });

  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

/**
 * Uploads a user profile photo to Supabase.
 */
export async function updateProfilePhoto(file: File): Promise<string> {
  if (!auth.currentUser) throw new Error("Not authenticated");
  const uid = auth.currentUser.uid;
  const photoURL = await uploadMediaToSupabase(file, `profiles/${uid}`);

  await updateProfile(auth.currentUser, { photoURL });
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { photoURL }, { merge: true });

  return photoURL;
}

/**
 * Uploads an APK file and returns the URL.
 */
export async function uploadAppFile(file: File, developerId: string, appName: string, onProgress?: (event: UploadProgressEvent) => void): Promise<string> {
  const { identifier, sanitized } = makeArchiveId('apk', developerId, appName);
  const filename = `${sanitized}.apk`;
  return uploadToArchiveOrg(file, identifier, filename, appName, onProgress);
}

/**
 * Uploads an App Icon and returns the URL.
 */
export async function uploadAppIcon(file: File, developerId: string, appName: string, onProgress?: (event: UploadProgressEvent) => void): Promise<string> {
  return uploadMediaToSupabase(file, `icons/${developerId}`, onProgress);
}

export async function uploadAppBanner(file: File, developerId: string, appName: string, onProgress?: (event: UploadProgressEvent) => void): Promise<string> {
  return uploadMediaToSupabase(file, `banners/${developerId}`, onProgress);
}

/**
 * Uploads a Government ID Document and returns the URL.
 */
export async function uploadGovtIdDocument(file: File, developerId: string, onProgress?: (event: UploadProgressEvent) => void): Promise<string> {
  return uploadMediaToSupabase(file, `verifications/${developerId}`, onProgress);
}

/**
 * Submits the App metadata to Firestore after files are uploaded.
 */
export async function submitAppListing(
  developerId: string,
  appName: string,
  description: string,
  category: string,
  version: string,
  apkUrl: string,
  iconUrl: string,
  sourceType: 'file' | 'url' = 'file',
  scheduledFor: number | null = null,
  supportWebsite: string = '',
  supportEmail: string = '',
  privacyPolicy: string = '',
  dataCollected: boolean = false,
  dataShared: boolean = false,
  dataEncrypted: boolean = false,
  accountDeletion: boolean = false,
  bannerUrl?: string,
  ageRating?: string,
  containsAds?: boolean,
  inAppPurchases?: boolean,
  virusScanStatus: 'clean' | 'suspicious' | 'malicious' | 'pending' = 'pending',
  status: string = 'pending_review',
  publishDate: number | null = null,
  isPlayable: boolean = false,
  playableUrl?: string
) {
  let finalStatus = status;
  let finalScanStatus = virusScanStatus;
  let scanLog = '';
  let finalScheduledFor = scheduledFor;

  try {
    const { runFullSecurityScan } = await import('@/lib/security');
    const { overallStatus, log } = await runFullSecurityScan(
      appName,
      description,
      developerId,
      category,
      apkUrl
    );
    
    finalScanStatus = overallStatus;
    scanLog = log;

    if (overallStatus === 'clean') {
      finalStatus = 'scheduled';
      const delayMs = isPlayable ? (2 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
      finalScheduledFor = Date.now() + delayMs;
    } else {
      finalStatus = 'pending_review';
      finalScheduledFor = null;
    }
  } catch (error) {
    console.error("Security Scan failed during submission:", error);
    finalScanStatus = 'suspicious'; // Default to suspicious if scan fails
    finalStatus = 'pending_review';
    finalScheduledFor = null;
  }

  const appsCollection = collection(db, 'apps');
  const appData = {
    developerId,
    appName,
    description,
    category,
    version,
    apkUrl,
    iconUrl,
    sourceType,
    scheduledFor: finalScheduledFor,
    status: finalStatus,
    publishDate,
    virusScanStatus: finalScanStatus,
    securityScanLog: scanLog,
    downloads: 0,
    rating: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    supportWebsite,
    supportEmail,
    privacyPolicy,
    dataCollected,
    dataShared,
    dataEncrypted,
    accountDeletion,
    bannerUrl: bannerUrl || null,
    ageRating: ageRating || '3+',
    containsAds: containsAds || false,
    inAppPurchases: inAppPurchases || false,
    isPlayable,
    playableUrl: playableUrl || null
  };

  const docRef = await addDoc(appsCollection, appData);
  return docRef.id;
}

/**
 * Uploads media (image/video) for an announcement.
 */
export async function uploadAnnouncementMedia(file: File, onProgress?: (event: UploadProgressEvent) => void): Promise<string> {
  return uploadMediaToSupabase(file, `announcements`, onProgress);
}

/**
 * Permanently deletes a file from Archive.org via the Cloudflare Proxy.
 * @param url The public Archive.org URL of the file to delete.
 */
export async function deleteFromArchiveOrg(url: string): Promise<void> {
  if (!url || !url.includes('archive.org/download/')) return;

  const workerUrl = process.env.NEXT_PUBLIC_ARCHIVE_ORG_WORKER_URL;
  if (!workerUrl) {
    console.error("Cannot delete from Archive.org: Worker URL missing");
    return;
  }

  try {
    // Extract identifier and filename from URL
    // Format: https://archive.org/download/IDENTIFIER/FILENAME
    const parts = url.split('archive.org/download/')[1].split('/');
    if (parts.length < 2) return;
    
    const identifier = parts[0];
    const filename = parts.slice(1).join('/'); // In case filename has slashes

    const endpoint = `${workerUrl}/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete: ${response.status} ${response.statusText}`);
    }
    
    console.log(`Successfully deleted ${filename} from Archive.org`);
  } catch (err) {
    console.error("Error deleting from Archive.org:", err);
  }
}
