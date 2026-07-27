"use client";
import React, { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/auth";
import { updateProfilePhoto } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { deleteUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteUserFootprint, getUserDownloadHistory, DownloadRecord } from "@/lib/db";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState<DownloadRecord[]>([]);

  const handleDeleteUserAccount = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      await deleteUserFootprint(user.uid);
      await deleteUser(user);
      alert("Account deleted successfully.");
      router.push("/");
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in before deleting your account.");
      } else {
        alert("Failed to delete account. " + e.message);
      }
    }
    setDeleting(false);
  };

  useEffect(() => {
    async function checkVerification() {
      if (user && (userData?.role === 'developer' || userData?.role === 'admin')) {
        const snap = await getDoc(doc(db, 'developers', user.uid));
        if (snap.exists()) {
          setIsVerified(!!snap.data().hasVerificationBadge);
        }
      }
    }
    checkVerification();
    
    async function loadHistory() {
      if (user) {
        const history = await getUserDownloadHistory(user.uid);
        setDownloadHistory(history);
      }
    }
    loadHistory();
  }, [user, userData]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploading(true);
    try {
      await updateProfilePhoto(file);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture. Please try again.");
    }
    setUploading(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface text-on-surface flex flex-col">
        <Navigation />
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left Column: Avatar & Actions */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative mb-6 group">
                <div className="w-40 h-40 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-5xl font-bold shadow-lg overflow-hidden border-4 border-surface">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (userData?.displayName || user?.displayName || "U")[0].toUpperCase()
                  )}
                </div>
                
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">{uploading ? 'sync' : 'photo_camera'}</span>
                  {uploading && <span className="material-symbols-outlined absolute animate-spin">sync</span>}
                  <input aria-label="Profile Image Upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
              </div>

              <h1 className="font-display-sm text-2xl font-bold text-center mb-1">
                {userData?.displayName || user?.displayName || "Unnamed User"}
              </h1>
              <div className="font-body-md text-on-surface-variant text-center mb-8">
                {user?.email}
              </div>

              <div className="w-full flex flex-col gap-3">
                {userData?.role !== 'developer' && userData?.role !== 'admin' && (
                  <button onClick={() => router.push('/register/developer')} className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-label-lg font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Become a Developer
                  </button>
                )}
                
                {(userData?.role === 'developer' || userData?.role === 'admin') && (
                  <button onClick={() => router.push('/dashboard')} className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-label-lg font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">dashboard</span>
                    Developer Dashboard
                  </button>
                )}

                {userData?.role === 'admin' && (
                  <button onClick={() => router.push('/admin')} className="w-full py-3 px-4 bg-error-container text-on-error-container rounded-xl font-label-lg font-bold hover:bg-error hover:text-on-error transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Admin Panel
                  </button>
                )}

                <button onClick={handleLogout} className="w-full py-3 px-4 bg-surface-variant text-on-surface-variant border border-outline-variant rounded-xl font-label-lg font-bold hover:bg-surface-container-highest transition-colors shadow-sm flex items-center justify-center gap-2 mt-4">
                  <span className="material-symbols-outlined">logout</span>
                  Log Out
                </button>
              </div>
            </div>

            {/* Right Column: Details & History */}
            <div className="w-full md:w-2/3 flex flex-col gap-8">
              
              {/* Profile Details Card */}
              <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 md:p-8">
                <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Account Details
                </h2>

                <div className="flex flex-col gap-6">
                  <div>
                    <div className="font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Account Type</div>
                    <div className="font-body-lg text-on-surface capitalize flex items-center gap-2">
                      {userData?.role || "User"}
                      {userData?.role === 'developer' && <span className="material-symbols-outlined text-primary text-sm">code</span>}
                      {userData?.role === 'admin' && <span className="material-symbols-outlined text-error text-sm">shield</span>}
                    </div>
                  </div>

                  {(userData?.role === 'developer' || userData?.role === 'admin') && (
                    <div className="pt-4 border-t border-outline-variant">
                      <div className="font-label-md text-on-surface-variant mb-2 uppercase tracking-wider">Verification Status</div>
                      <div className="flex items-center justify-between bg-surface-container rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                          {isVerified ? (
                            <>
                              <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              </div>
                              <div>
                                <div className="font-bold text-green-500">Verified Developer</div>
                                <div className="font-body-sm text-on-surface-variant">Your identity has been confirmed.</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">pending_actions</span>
                              </div>
                              <div>
                                <div className="font-bold text-yellow-600">Unverified</div>
                                <div className="font-body-sm text-on-surface-variant">Complete verification for a blue tick.</div>
                              </div>
                            </>
                          )}
                        </div>
                        {!isVerified && (
                          <button onClick={() => router.push('/dashboard/verification')} className="px-4 py-2 bg-surface text-primary border border-primary/30 rounded-xl font-label-lg font-bold hover:bg-primary/10 transition-colors">
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Download History Card */}
              <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 md:p-8">
                <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Download History
                </h2>

                {downloadHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">download_done</span>
                    </div>
                    <div className="font-body-lg text-on-surface-variant">No apps downloaded yet.</div>
                    <button onClick={() => router.push('/')} className="mt-4 text-primary font-bold hover:underline">
                      Explore the Store
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {downloadHistory.map(record => (
                      <a key={record.id} href={`/app?id=${record.appId}`} className="group flex flex-col items-center p-4 bg-surface-container rounded-2xl border border-transparent hover:border-outline-variant hover:bg-surface-container-highest transition-all">
                        <img src={record.iconUrl} alt={record.appName} className="w-16 h-16 rounded-2xl object-cover shadow-sm mb-3 group-hover:scale-105 transition-transform" />
                        <div className="font-label-lg font-bold text-on-surface text-center truncate w-full">{record.appName}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 md:p-8 mt-4">
                <h2 className="font-headline-sm font-bold text-red-500 mb-2">Danger Zone</h2>
                <p className="font-body-sm text-on-surface-variant mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                  onClick={handleDeleteUserAccount}
                  disabled={deleting}
                  className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-label-lg font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">delete_forever</span>
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>

            </div>
          </div>
          
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
}
