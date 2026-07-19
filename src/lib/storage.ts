import { updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { supabase } from './supabase';

const BUCKET_NAME = 'aero store';

/**
 * Generic function to upload a file to Supabase Storage.
 */
async function uploadToSupabase(
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<string> {
  // Supabase doesn't easily support chunked progress callbacks in the JS client without complex TUS setups.
  // We'll simulate 50% on start, 100% on finish for UI feedback.
  if (onProgress) onProgress(50);
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      upsert: true
    });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw error;
  }

  if (onProgress) onProgress(100);

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

/**
 * Helper to delete a file from Supabase using its public URL
 */
export async function deleteFromSupabase(publicUrl: string): Promise<void> {
  try {
    // The public URL looks like: https://[project].supabase.co/storage/v1/object/public/aero%20store/path/to/file
    const parts = publicUrl.split(`/public/${encodeURIComponent(BUCKET_NAME)}/`);
    if (parts.length === 2) {
      const path = parts[1];
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
      if (error) {
        console.error("Supabase Delete Error:", error);
      }
    } else {
       // Also check if it's not encoded
       const partsUnencoded = publicUrl.split(`/public/${BUCKET_NAME}/`);
       if (partsUnencoded.length === 2) {
           const path = partsUnencoded[1];
           const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
           if (error) {
               console.error("Supabase Delete Error:", error);
           }
       }
    }
  } catch (err) {
    console.error("Failed to delete from Supabase:", err);
  }
}

/**
 * Uploads a profile picture and updates the user's Auth profile and Firestore doc.
 */
export async function uploadProfilePicture(file: File, uid: string, onProgress?: (progress: number) => void): Promise<string> {
  if (!auth.currentUser) throw new Error("Must be logged in to upload profile picture.");
  if (auth.currentUser.uid !== uid) throw new Error("Unauthorized to modify this profile.");

  const path = `profiles/${uid}/${Date.now()}_${file.name}`;
  const photoURL = await uploadToSupabase(file, path, onProgress);

  await updateProfile(auth.currentUser, { photoURL });
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { photoURL }, { merge: true });

  return photoURL;
}

/**
 * Uploads an APK file and returns the URL.
 */
export async function uploadAppFile(file: File, developerId: string, appName: string, onProgress?: (progress: number) => void): Promise<string> {
  const path = `apps/${developerId}/${appName}/app_${Date.now()}.apk`;
  return uploadToSupabase(file, path, onProgress);
}

/**
 * Uploads an App Icon and returns the URL.
 */
export async function uploadAppIcon(file: File, developerId: string, appName: string, onProgress?: (progress: number) => void): Promise<string> {
  const path = `apps/${developerId}/${appName}/icon_${Date.now()}_${file.name}`;
  return uploadToSupabase(file, path, onProgress);
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
  accountDeletion: boolean = false
) {
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
    scheduledFor,
    status: 'pending_review',
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
    accountDeletion
  };

  const docRef = await addDoc(appsCollection, appData);
  return docRef.id;
}

/**
 * Uploads media (image/video) for an announcement.
 */
export async function uploadAnnouncementMedia(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const path = `announcements/${Date.now()}_${file.name}`;
  return uploadToSupabase(file, path, onProgress);
}
