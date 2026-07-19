import { collection, doc, getDocs, getDoc, query, orderBy, updateDoc, increment, where, limit, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Review {
  id: string;
  appId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: any;
}

export interface AppListing {
  id: string;
  developerId: string;
  appName: string;
  description: string;
  category: string;
  version: string;
  apkUrl: string;
  iconUrl: string;
  whatsNew?: string;
  status: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  createdAt: any;
  updatedAt: any;
  supportWebsite?: string;
  supportEmail?: string;
  privacyPolicy?: string;
  dataCollected?: boolean;
  dataShared?: boolean;
  dataEncrypted?: boolean;
  accountDeletion?: boolean;
}

export interface Developer {
  companyName: string;
  organizationEmail?: string;
  address: string;
  addressPrivate: boolean;
  lat?: number;
  lng?: number;
  verificationStatus: string;
  hasVerificationBadge: boolean;
  totalApps: number;
  createdAt: any;
  strikes?: number;
}

export interface VerificationForm {
  id?: string;
  developerId: string;
  developerName?: string;
  companyName?: string;
  organizationEmail?: string;
  personalEmail?: string;
  address?: string;
  status: 'submitted' | 'action_required' | 'verified' | 'rejected';
  govtId: string;
  remark?: string;
  createdAt: any;
  updatedAt: any;
}

export interface DeletionRequest {
  id?: string;
  developerId: string;
  developerName: string;
  reason: string;
  status: 'pending' | 'accepted';
  requestedAt: any;
  acceptedAt?: any;
}

/**
 * Fetches all PUBLIC apps for the storefront.
 * Now strictly filters for status == 'published'
 */
export async function getAllApps(): Promise<AppListing[]> {
  const appsRef = collection(db, 'apps');
  const q = query(appsRef, where('status', '==', 'published'));
  
  const querySnapshot = await getDocs(q);
  const apps: AppListing[] = [];
  
  querySnapshot.forEach((doc) => {
    apps.push({ id: doc.id, ...doc.data() } as AppListing);
  });
  
  apps.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  return apps;
}

/**
 * Fetches apps filtered by a specific category (must be published).
 */
export async function getAppsByCategory(category: string): Promise<AppListing[]> {
  const appsRef = collection(db, 'apps');
  const q = query(appsRef, where('category', '==', category), where('status', '==', 'published'));
  
  const querySnapshot = await getDocs(q);
  const apps: AppListing[] = [];
  
  querySnapshot.forEach((doc) => {
    apps.push({ id: doc.id, ...doc.data() } as AppListing);
  });
  
  apps.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  return apps;
}

/**
 * Fetches all pending apps (For Admins only)
 */
export async function getPendingApps(): Promise<AppListing[]> {
  const appsRef = collection(db, 'apps');
  const q = query(appsRef, where('status', '==', 'pending_review'));
  
  const querySnapshot = await getDocs(q);
  const apps: AppListing[] = [];
  
  querySnapshot.forEach((doc) => {
    apps.push({ id: doc.id, ...doc.data() } as AppListing);
  });
  
  apps.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
  return apps;
}

/**
 * Updates an app's status (e.g. to 'published' or 'rejected')
 */
export async function updateAppStatus(appId: string, status: 'published' | 'rejected'): Promise<void> {
  const docRef = doc(db, 'apps', appId);
  await updateDoc(docRef, {
    status: status
  });
}

/**
 * Updates an existing App metadata (e.g. for a new version upload)
 */
export async function updateAppListing(
  appId: string,
  updates: Partial<{
    version: string;
    apkUrl: string;
    whatsNew: string;
  }>
): Promise<void> {
  const docRef = doc(db, 'apps', appId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/**
 * Fetches a single app by its document ID.
 */
export async function getAppById(appId: string): Promise<AppListing | null> {
  const docRef = doc(db, 'apps', appId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as AppListing;
  }
  
  return null;
}

/**
 * Increments the download count for an app.
 */
export async function incrementAppDownloadCount(appId: string): Promise<void> {
  const docRef = doc(db, 'apps', appId);
  await updateDoc(docRef, {
    downloads: increment(1)
  });
}

/**
 * ==========================================
 * PHASE 5: ADVANCED ADMIN & ANNOUNCEMENTS
 * ==========================================
 */

export interface Announcement {
  id?: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  active: boolean;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  scheduledFor?: number | null;
  expiresAt?: number | null;
  createdAt: any;
  updatedAt?: any;
}

/**
 * Publishes a new announcement for the storefront.
 */


export async function publishAnnouncement(
  message: string, 
  type: 'info' | 'warning' | 'success', 
  mediaUrl: string | null = null, 
  mediaType: 'image' | 'video' | null = null,
  scheduledFor: number | null = null,
  expiresAt: number | null = null
): Promise<void> {
  const annRef = collection(db, 'announcements');
  
  // We no longer automatically deactivate all old announcements because we might have future scheduled ones.
  // Admins must manually delete/deactivate old ones if they want, OR rely on expiresAt.
  // Actually, we can keep the auto-deactivate logic for announcements without a scheduled time, 
  // but let's just let them coexist and rely on time window filtering.
  
  await addDoc(annRef, {
    message,
    type,
    active: true,
    mediaUrl,
    mediaType,
    scheduledFor,
    expiresAt,
    createdAt: serverTimestamp()
  });
}

/**
 * Fetches all announcements (History for Admin Panel)
 */


export async function getAllAnnouncements(): Promise<Announcement[]> {
  const annRef = collection(db, 'announcements');
  const q = query(annRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const announcements: Announcement[] = [];
  snap.forEach(d => {
    announcements.push({ id: d.id, ...d.data() } as Announcement);
  });
  return announcements;
}

import { deleteFromSupabase } from './storage';

/**
 * Deletes an announcement permanently
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  const docRef = doc(db, 'announcements', id);
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().mediaUrl) {
    await deleteFromSupabase(snap.data().mediaUrl);
  }
  await deleteDoc(docRef);
}

/**
 * Updates an existing announcement
 */
export async function editAnnouncement(
  id: string,
  updates: Partial<{
    message: string;
    type: 'info' | 'warning' | 'success';
    mediaUrl: string | null;
    mediaType: 'image' | 'video' | null;
    scheduledFor: number | null;
    expiresAt: number | null;
    active: boolean;
  }>
): Promise<void> {
  const docRef = doc(db, 'announcements', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/**
 * Fetches the currently active announcement (if any)
 */
export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const annRef = collection(db, 'announcements');
  const q = query(annRef, where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    const docData = snap.docs[0];
    return { id: docData.id, ...docData.data() } as Announcement;
  }
  return null;
}

/**
 * Fetches all registered users for Staff Management (Admin only)
 */
export async function getAllUsers(): Promise<any[]> {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  const users: any[] = [];
  snap.forEach(d => {
    users.push({ uid: d.id, ...d.data() });
  });
  return users;
}

/**
 * Updates a user's role (Admin only)
 */
export async function updateUserRole(uid: string, newRole: 'user' | 'developer' | 'staff' | 'manager' | 'admin'): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role: newRole
  });
}

/**
 * Updates a developer's profile
 */
export async function updateDeveloperProfile(uid: string, updates: Partial<Developer>): Promise<void> {
  const devRef = doc(db, 'developers', uid);
  await updateDoc(devRef, updates);
}

/**
 * ==========================================
 * VERIFICATION SYSTEM (Aero Tick)
 * ==========================================
 */

export async function submitVerificationRequest(developerId: string, govtId: string, snapshot: any): Promise<void> {
  const verificationsRef = collection(db, 'verifications');
  await addDoc(verificationsRef, {
    developerId,
    status: 'submitted',
    govtId,
    developerName: snapshot.developerName || '',
    companyName: snapshot.companyName || '',
    organizationEmail: snapshot.organizationEmail || '',
    personalEmail: snapshot.personalEmail || '',
    address: snapshot.address || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateVerificationRequest(formId: string, govtId: string, snapshot: any): Promise<void> {
  const docRef = doc(db, 'verifications', formId);
  await updateDoc(docRef, {
    status: 'submitted', // Reset back to submitted when edited
    govtId,
    developerName: snapshot.developerName || '',
    companyName: snapshot.companyName || '',
    organizationEmail: snapshot.organizationEmail || '',
    personalEmail: snapshot.personalEmail || '',
    address: snapshot.address || '',
    updatedAt: serverTimestamp()
  });
}

export async function getDeveloperVerifications(developerId: string): Promise<VerificationForm[]> {
  const verificationsRef = collection(db, 'verifications');
  const q = query(verificationsRef, where('developerId', '==', developerId));
  const snap = await getDocs(q);
  const forms: VerificationForm[] = [];
  
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (const d of snap.docs) {
    const data = d.data() as VerificationForm;
    if (data.status === 'rejected' && data.updatedAt) {
      const updatedMs = data.updatedAt.toMillis ? data.updatedAt.toMillis() : data.updatedAt;
      if (now - updatedMs > ONE_DAY_MS) {
        await deleteDoc(doc(db, 'verifications', d.id));
        continue;
      }
    }
    forms.push({ id: d.id, ...data });
  }

  forms.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  return forms;
}

export async function getAllPendingVerifications(): Promise<VerificationForm[]> {
  const verificationsRef = collection(db, 'verifications');
  const q = query(verificationsRef, where('status', 'in', ['submitted', 'action_required', 'verified']));
  const snap = await getDocs(q);
  const forms: VerificationForm[] = [];
  
  // Fetch developer details for the UI
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as VerificationForm;
    try {
      const userRef = doc(db, 'users', data.developerId);
      const userSnap = await getDoc(userRef);
      const devRef = doc(db, 'developers', data.developerId);
      const devSnap = await getDoc(devRef);
      
      let dName = "Unknown";
      let cName = "";
      if (userSnap.exists()) dName = userSnap.data().displayName || dName;
      if (devSnap.exists()) cName = devSnap.data().companyName || "";
      
      forms.push({ id: docSnap.id, ...data, developerName: dName, companyName: cName });
    } catch(e) {
      forms.push({ id: docSnap.id, ...data, developerName: "Unknown" });
    }
  }
  
  forms.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  return forms;
}

export async function adminReviewVerification(formId: string, developerId: string, status: 'action_required' | 'verified' | 'rejected', remark: string = ""): Promise<void> {
  const docRef = doc(db, 'verifications', formId);
  await updateDoc(docRef, {
    status,
    remark,
    updatedAt: serverTimestamp()
  });

  // If verified, update the developer's main profile to have the badge
  if (status === 'verified') {
    const devRef = doc(db, 'developers', developerId);
    await updateDoc(devRef, {
      hasVerificationBadge: true,
      verificationStatus: 'verified'
    });
  }
}

export async function revokeVerification(formId: string, developerId: string): Promise<void> {
  const formRef = doc(db, 'verifications', formId);
  await updateDoc(formRef, {
    status: 'rejected',
    remark: 'Revoked by Admin due to suspicious activity.',
    updatedAt: serverTimestamp()
  });
  
  const devRef = doc(db, 'developers', developerId);
  await updateDoc(devRef, {
    hasVerificationBadge: false,
    verificationStatus: 'unverified'
  });
}

/**
 * ==========================================
 * ACCOUNT DELETION SYSTEM
 * ==========================================
 */

export async function deleteUserFootprint(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
  await deleteDoc(doc(db, 'developers', uid));
  
  const vRef = collection(db, 'verifications');
  const q = query(vRef, where('developerId', '==', uid));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'verifications', d.id));
  }
  
  // Also clean up any active deletion requests
  const drRef = collection(db, 'deletion_requests');
  const dq = query(drRef, where('developerId', '==', uid));
  const dSnap = await getDocs(dq);
  for (const d of dSnap.docs) {
    await deleteDoc(doc(db, 'deletion_requests', d.id));
  }
}

export async function submitDeletionRequest(developerId: string, developerName: string, reason: string): Promise<void> {
  const reqRef = collection(db, 'deletion_requests');
  await addDoc(reqRef, {
    developerId,
    developerName,
    reason,
    status: 'pending',
    requestedAt: serverTimestamp()
  });
}

export async function getDeletionRequests(): Promise<DeletionRequest[]> {
  const reqRef = collection(db, 'deletion_requests');
  const snap = await getDocs(reqRef);
  const reqs: DeletionRequest[] = [];
  snap.forEach(d => reqs.push({ id: d.id, ...d.data() } as DeletionRequest));
  reqs.sort((a, b) => (b.requestedAt?.toMillis() || 0) - (a.requestedAt?.toMillis() || 0));
  return reqs;
}

export async function getMyDeletionRequest(devId: string): Promise<DeletionRequest | null> {
  const reqRef = collection(db, 'deletion_requests');
  const q = query(reqRef, where('developerId', '==', devId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() } as DeletionRequest;
  return null;
}

export async function cancelDeletionRequest(reqId: string): Promise<void> {
  await deleteDoc(doc(db, 'deletion_requests', reqId));
}

export async function acceptDeletionRequest(reqId: string): Promise<void> {
  await updateDoc(doc(db, 'deletion_requests', reqId), {
    status: 'accepted',
    acceptedAt: serverTimestamp()
  });
}

/**
 * ==========================================
 * PHASE 8: REAL-TIME SYNC & ADVANCED PUBLISHING
 * ==========================================
 */

import { onSnapshot } from 'firebase/firestore';

/**
 * Subscribes to published apps in real-time, filtering out scheduled apps that are not yet due.
 */
export function subscribeToPublishedApps(callback: (apps: AppListing[]) => void) {
  const appsRef = collection(db, 'apps');
  const q = query(appsRef, where('status', '==', 'published'));
  
  return onSnapshot(q, (snapshot) => {
    const apps: AppListing[] = [];
    const now = Date.now();
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // If scheduledFor exists and is in the future, skip it
      if (data.scheduledFor && data.scheduledFor > now) {
        return;
      }
      apps.push({ id: docSnap.id, ...data } as AppListing);
    });
    apps.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    callback(apps);
  });
}

/**
 * Subscribes to active announcements in real-time.
 */
export function subscribeToActiveAnnouncements(callback: (anns: Announcement[]) => void) {
  const annRef = collection(db, 'announcements');
  // Fetch all active announcements
  const q = query(annRef, where('active', '==', true));
  
  return onSnapshot(q, (snapshot) => {
    const now = Date.now();
    const validAnns: Announcement[] = [];
    
    // Find announcements that are within the active time window
    const candidates = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
    // Sort descending by creation date
    candidates.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    
    for (const docData of candidates) {
      if (docData.scheduledFor && docData.scheduledFor > now) continue;
      if (docData.expiresAt && docData.expiresAt < now) continue;
      
      validAnns.push(docData);
    }
    
    callback(validAnns);
  });
}

/**
 * Deletes an app permanently
 */
export async function deleteApp(appId: string): Promise<void> {
  const docRef = doc(db, 'apps', appId);
  await deleteDoc(docRef);
}

/**
 * Subscribes to a specific developer's apps in real-time.
 */
export function subscribeToDeveloperApps(developerId: string, callback: (apps: AppListing[]) => void) {
  const appsRef = collection(db, 'apps');
  const q = query(appsRef, where('developerId', '==', developerId));
  
  return onSnapshot(q, (snapshot) => {
    const apps: AppListing[] = [];
    snapshot.forEach((docSnap) => {
      apps.push({ id: docSnap.id, ...docSnap.data() } as AppListing);
    });
    apps.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    callback(apps);
  });
}


export async function submitReview(appId: string, userId: string, userName: string, rating: number, text: string) {
  const reviewsRef = collection(db, 'reviews');
  await addDoc(reviewsRef, {
    appId,
    userId,
    userName,
    rating,
    text,
    createdAt: serverTimestamp()
  });

  // Update app average rating
  const appRef = doc(db, 'apps', appId);
  const appSnap = await getDoc(appRef);
  if (appSnap.exists()) {
    const data = appSnap.data();
    const currentRating = data.rating || 0;
    const currentCount = data.ratingCount || 0;
    
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + rating) / newCount;
    
    await updateDoc(appRef, {
      rating: newRating,
      ratingCount: newCount
    });
  }
}

export async function getReviewsForApp(appId: string): Promise<Review[]> {
  const reviewsRef = collection(db, 'reviews');
  const q = query(reviewsRef, where('appId', '==', appId));
  const snapshot = await getDocs(q);
  const reviews: Review[] = [];
  snapshot.forEach(docSnap => {
    reviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
  });
  reviews.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  return reviews;
}

export async function deleteReview(reviewId: string, appId: string) {
  // Get review to adjust rating
  const reviewRef = doc(db, 'reviews', reviewId);
  const revSnap = await getDoc(reviewRef);
  
  if (revSnap.exists()) {
    const ratingToRemove = revSnap.data().rating || 0;
    
    // Delete the review
    await deleteDoc(reviewRef);
    
    // Update app rating
    const appRef = doc(db, 'apps', appId);
    const appSnap = await getDoc(appRef);
    if (appSnap.exists()) {
      const data = appSnap.data();
      const currentRating = data.rating || 0;
      const currentCount = data.ratingCount || 0;
      
      if (currentCount > 1) {
        const newCount = currentCount - 1;
        const newRating = ((currentRating * currentCount) - ratingToRemove) / newCount;
        await updateDoc(appRef, { rating: newRating, ratingCount: newCount });
      } else {
        await updateDoc(appRef, { rating: 0, ratingCount: 0 });
      }
    }
  }
}

/**
 * ==========================================
 * PHASE 7: APP DOWNLOAD TRACKING
 * ==========================================
 */

export interface DownloadRecord {
  id?: string;
  userId: string;
  appId: string;
  appName: string;
  iconUrl: string;
  downloadedAt: any;
}

export async function recordAppDownload(userId: string, appId: string, appName: string, iconUrl: string): Promise<void> {
  const downloadsRef = collection(db, 'downloads');
  await addDoc(downloadsRef, {
    userId,
    appId,
    appName,
    iconUrl,
    downloadedAt: serverTimestamp()
  });
}

export async function getUserDownloadHistory(userId: string): Promise<DownloadRecord[]> {
  const downloadsRef = collection(db, 'downloads');
  const q = query(downloadsRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  const records: DownloadRecord[] = [];
  snap.forEach(d => records.push({ id: d.id, ...d.data() } as DownloadRecord));
  records.sort((a, b) => (b.downloadedAt?.toMillis() || 0) - (a.downloadedAt?.toMillis() || 0));
  return records;
}

export async function getAllUserDownloadHistories(): Promise<DownloadRecord[]> {
  const downloadsRef = collection(db, 'downloads');
  const snap = await getDocs(downloadsRef);
  const records: DownloadRecord[] = [];
  snap.forEach(d => records.push({ id: d.id, ...d.data() } as DownloadRecord));
  records.sort((a, b) => (b.downloadedAt?.toMillis() || 0) - (a.downloadedAt?.toMillis() || 0));
  return records;
}

