"use client";
import React, { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/auth";
import { uploadProfilePicture } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { deleteUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteUserFootprint, getUserDownloadHistory, DownloadRecord } from "@/lib/db";

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
      await uploadProfilePicture(file, user.uid);
      // Reload page to reflect changes
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture. Please try again.");
    }
    setUploading(false);
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', padding: '80px 16px', background: 'var(--bg)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          
          {/* Header */}
          <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '32px' }}>Profile</h1>
          
          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c1), var(--c2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '48px', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (userData?.displayName || user?.displayName || "U")[0].toUpperCase()
              )}
              <label style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--c1)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'wait' : 'pointer', fontSize: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}>
                📷
                <input aria-label="Profile Image Upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
          </div>
          
          {/* Details List */}
          <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '32px', padding: 0 }}>
            
            {/* Name */}
            <div style={{ display: 'flex', gap: '16px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '24px', opacity: 0.5 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Name</div>
                <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {userData?.displayName || user?.displayName || "N/A"}
                  {isVerified && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00A3FF" xmlns="http://www.w3.org/2000/svg">
                      <title>Verified Developer</title>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            {/* Email */}
            <div style={{ display: 'flex', gap: '16px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '24px', opacity: 0.5 }}>📧</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '16px', fontWeight: 600, wordBreak: 'break-all' }}>{user?.email || "N/A"}</div>
              </div>
            </div>
            
            {/* Account Type */}
            <div style={{ display: 'flex', gap: '16px', padding: '20px', borderBottom: (userData?.role === 'developer' || userData?.role === 'admin') ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ fontSize: '24px', opacity: 0.5 }}>💼</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Account Type</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--c2)', textTransform: 'capitalize' }}>
                  {userData?.role || "User"}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            {(userData?.role === 'developer' || userData?.role === 'admin') && (
              <div style={{ display: 'flex', gap: '16px', padding: '20px' }}>
                <div style={{ fontSize: '24px', opacity: 0.5 }}>🛡️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Verification Status</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: isVerified ? '#00FF00' : '#FFB300' }}>
                      {isVerified ? 'Verified' : 'Unverified'}
                    </div>
                    {!isVerified && (
                      <a href="/dashboard/verification" className="btn-glass" style={{ fontSize: '13px', color: '#00A3FF', textDecoration: 'none', background: 'rgba(0,163,255,0.1)', padding: '6px 14px', borderRadius: '100px', fontWeight: 600 }}>
                        Apply for Aero Tick
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Download History Section */}
          <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '32px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📥</span> My Download History
            </h2>
            
            {downloadHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px', padding: '20px' }}>
                You haven't downloaded any apps yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
                {downloadHistory.map(record => (
                  <a key={record.id} href={`/app?id=${record.appId}`} style={{ display: 'block', textDecoration: 'none', position: 'relative', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ width: '100%', aspectRatio: '1', marginBottom: '8px' }}>
                      <img src={record.iconUrl} alt={record.appName} style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                      {record.appName}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userData?.role !== 'developer' && userData?.role !== 'admin' && (
              <>
                <a href="/register/developer/" className="btn-glass btn-glass-primary" style={{ width: '100%', padding: '16px', textAlign: 'center', display: 'block', fontSize: '16px' }}>
                  Upgrade to Developer
                </a>
                <button 
                  onClick={handleDeleteUserAccount}
                  disabled={deleting}
                  style={{ width: '100%', padding: '16px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: deleting ? 'wait' : 'pointer' }}
                >
                  {deleting ? 'Deleting...' : '🗑️ Delete Account'}
                </button>
              </>
            )}
            
            {(userData?.role === 'developer' || userData?.role === 'admin') && (
              <a href="/dashboard/" className="btn-glass btn-glass-primary" style={{ width: '100%', padding: '16px', textAlign: 'center', display: 'block', fontSize: '16px' }}>
                Go to Developer Dashboard
              </a>
            )}

            {userData?.role === 'admin' && (
              <a href="/admin/" style={{ width: '100%', padding: '16px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', textAlign: 'center', display: 'block' }}>
                🛡️ Go to Admin Panel
              </a>
            )}

            <button onClick={handleLogout} style={{ width: '100%', padding: '16px', background: 'var(--surface2)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>🚪</span> Log Out
            </button>
          </div>
          
        </div>
      </div>
    </AuthGuard>
  );
}
