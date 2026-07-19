"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePicture } from '@/lib/storage';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateDeveloperProfile, Developer, submitVerificationRequest, updateVerificationRequest, getDeveloperVerifications, VerificationForm, getMyDeletionRequest, submitDeletionRequest, cancelDeletionRequest, DeletionRequest, subscribeToDeveloperApps, AppListing } from '@/lib/db';
import { updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [developerData, setDeveloperData] = useState<Developer | null>(null);

  const [devName, setDevName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [address, setAddress] = useState("");
  const [addressPrivate, setAddressPrivate] = useState(false);
  
  const [verifications, setVerifications] = useState<VerificationForm[]>([]);
  const [activeGovtId, setActiveGovtId] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [isFormLocked, setIsFormLocked] = useState(false);

  const [apps, setApps] = useState<AppListing[]>([]);
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [submittingDeletion, setSubmittingDeletion] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let unsubApps: () => void;
    async function loadDevProfile() {
      if (!user) return;
      setDevName(user.displayName || "");

      unsubApps = subscribeToDeveloperApps(user.uid, (data) => setApps(data));
      const myReq = await getMyDeletionRequest(user.uid);
      setDeletionRequest(myReq);
      if (userData?.role === 'developer' || userData?.role === 'admin') {
        const snap = await getDoc(doc(db, 'developers', user.uid));
        if (snap.exists()) {
          const data = snap.data() as Developer;
          setDeveloperData(data);
          setCompanyName(data.companyName || "");
          setOrgEmail(data.organizationEmail || "");
          setAddress(data.address || "");
          setAddressPrivate(data.addressPrivate ?? false);
          const forms = await getDeveloperVerifications(user.uid);
          setVerifications(forms);
          if (forms.length > 0) {
            const latest = forms[0];
            if (latest.status === 'submitted' || latest.status === 'verified') {
              setIsFormLocked(true);
            }
          }
          const actionRequiredForm = forms.find(f => f.status === 'action_required');
          if (actionRequiredForm) {
            setActiveGovtId(actionRequiredForm.govtId);
          }
        }
      }
    }
    loadDevProfile();
    return () => {
      if (unsubApps) unsubApps();
    };
  }, [user, userData]);

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploading(true);
    try {
      await uploadProfilePicture(file, user.uid);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    }
    setUploading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // Update Firebase Auth Display Name
      if (devName !== user.displayName) {
        await updateProfile(user, { displayName: devName });
      }

      // Update Developer Profile in Firestore
      if (developerData) {
        await updateDeveloperProfile(user.uid, {
          companyName: companyName,
          organizationEmail: orgEmail,
          address: address,
          addressPrivate: addressPrivate,
        });
      }
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save changes.");
    }
    setSaving(false);
  };



  const profilePhoto = userData?.photoURL || user?.photoURL;
  const initial = (userData?.displayName || user?.displayName || "U")[0].toUpperCase();

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Settings</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>Manage your developer account settings and public profile.</p>

      {/* Avatar Section */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--c2)' }} />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c1), var(--c2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '36px', fontWeight: 'bold' }}>
              {initial}
            </div>
          )}
          <label style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--bg)', padding: '8px', borderRadius: '50%', cursor: uploading ? 'wait' : 'pointer', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✏️
            <input aria-label="Profile upload" type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleProfilePhotoChange} />
          </label>
        </div>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Profile Picture</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Update your public developer avatar. This will automatically sync across the main store and dashboard.</p>
          {uploading && <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--c2)' }}>Uploading...</div>}
        </div>
      </div>

      <form onSubmit={handleSaveProfile}>
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Public Information</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>This information will be displayed on your app listings. Email cannot be changed.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Developer Name * (Locked)</label>
              <input aria-label="Developer Name" type="text" value={devName} disabled style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'not-allowed', outline: 'none' }} title="Your personal developer name cannot be changed." />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Organization / Studio Name {isFormLocked && '(Locked)'}</label>
              <input aria-label="Organization Name" type="text" value={companyName} disabled={isFormLocked} onChange={(e) => setCompanyName(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: isFormLocked ? 'transparent' : 'rgba(255,255,255,0.05)', border: isFormLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: isFormLocked ? 'rgba(255,255,255,0.5)' : '#fff', cursor: isFormLocked ? 'not-allowed' : 'text', outline: 'none' }} placeholder="If provided, this overrides Developer Name publicly." />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Organization Email {isFormLocked && '(Locked)'}</label>
              <input aria-label="Organization Email" type="email" value={orgEmail} disabled={isFormLocked} onChange={(e) => setOrgEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: isFormLocked ? 'transparent' : 'rgba(255,255,255,0.05)', border: isFormLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: isFormLocked ? 'rgba(255,255,255,0.5)' : '#fff', cursor: isFormLocked ? 'not-allowed' : 'text', outline: 'none' }} placeholder="Support email shown to users (defaults to personal email if blank)" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Personal Account Email</label>
              <input aria-label="Email Address" type="text" value={user?.email || ""} disabled style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'not-allowed', outline: 'none' }} />
            </div>
          </div>
        </div>

        {developerData && (
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Address Details</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>For safety and compliance, developers must provide a valid address. This is required for verification.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Full Address {isFormLocked && '(Locked)'}</label>
                <textarea aria-label="Full Address" rows={3} value={address} disabled={isFormLocked} onChange={(e) => setAddress(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: isFormLocked ? 'transparent' : 'rgba(255,255,255,0.05)', border: isFormLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: isFormLocked ? 'rgba(255,255,255,0.5)' : '#fff', resize: 'vertical', cursor: isFormLocked ? 'not-allowed' : 'text', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
                <input type="checkbox" id="displayAddress" checked={!addressPrivate} onChange={(e) => setAddressPrivate(!e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--c1)', cursor: 'pointer' }} />
                <label htmlFor="displayAddress" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>
                  <strong>Display Address Publicly</strong>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>If disabled, users will only see your Name, Org Name, and Email. The map is never shown to regular users.</div>
                </label>
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving}
          className="btn-glass btn-glass-primary"
          style={{ width: '100%', padding: '16px', fontSize: '16px', marginBottom: '40px' }}
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>



      {/* Account Deletion Section */}
      <div className="glass-panel" style={{ border: '1px solid rgba(255,77,77,0.3)', padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#ff4d4d' }}>Danger Zone: Delete Developer Account</h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
          Deleting your developer account is a permanent action. You must delete all your apps from the platform before requesting deletion.
        </p>

        {deletionRequest ? (
          <div style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.3)', padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ color: '#FFB300', marginBottom: '8px', fontSize: '16px' }}>
              {deletionRequest.status === 'accepted' ? 'Deletion Request Accepted' : 'Deletion Request Pending'}
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>
              {deletionRequest.status === 'accepted' 
                ? "Admin has accepted your request. Your account will be permanently deleted in 30 days."
                : "Your deletion request is waiting for Admin approval (or will auto-delete in 1 year)."}
            </p>
            <button 
              onClick={async () => {
                if (!confirm("Are you sure you want to cancel your deletion request and recover your account?")) return;
                try {
                  await cancelDeletionRequest(deletionRequest.id!);
                  setDeletionRequest(null);
                  alert("Account recovered successfully!");
                } catch(e) {
                  alert("Failed to cancel deletion request.");
                }
              }}
              style={{ padding: '12px 24px', background: 'var(--surface2)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel Deletion Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px' }}>
              <strong>Current Apps:</strong> {apps.length} 
              {apps.length > 0 && <span style={{ color: '#ff4d4d', marginLeft: '8px' }}>(You must delete these first)</span>}
            </div>
            
            <textarea
              placeholder="Why are you deleting your account? (Required)"
              value={deletionReason}
              onChange={e => setDeletionReason(e.target.value)}
              disabled={apps.length > 0}
              rows={3}
              style={{ width: '100%', padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', resize: 'vertical', opacity: apps.length > 0 ? 0.5 : 1 }}
            />
            
            <button
              onClick={async () => {
                if (apps.length > 0) return alert("You must delete all your apps before requesting account deletion.");
                if (!deletionReason.trim()) return alert("Please provide a reason for deleting your account.");
                if (!confirm("Submit deletion request to Admin?")) return;
                
                setSubmittingDeletion(true);
                try {
                  await submitDeletionRequest(user?.uid || '', devName, deletionReason);
                  const req = await getMyDeletionRequest(user?.uid || '');
                  setDeletionRequest(req);
                  alert("Deletion request submitted to Admin.");
                } catch(e) {
                  alert("Failed to submit request.");
                }
                setSubmittingDeletion(false);
              }}
              disabled={apps.length > 0 || submittingDeletion}
              style={{ padding: '12px 24px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', fontWeight: 600, cursor: apps.length > 0 || submittingDeletion ? 'not-allowed' : 'pointer', opacity: apps.length > 0 || submittingDeletion ? 0.5 : 1, width: 'fit-content' }}
            >
              {submittingDeletion ? 'Submitting...' : 'Request Account Deletion'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
