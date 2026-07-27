"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfilePhoto } from '@/lib/storage';
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
      await updateProfilePhoto(file);
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
      <h1 className="text-4xl font-extrabold mb-2 text-on-surface">Settings</h1>
      <p className="text-on-surface-variant mb-8">Manage your developer account settings and public profile.</p>

      {/* Avatar Section */}
      <div className="bg-surface-container border border-outline-variant p-8 rounded-2xl mb-6 flex gap-8 items-center shadow-sm">
        <div className="relative w-24 h-24 flex-shrink-0">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow-sm" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-4xl font-bold shadow-sm">
              {initial}
            </div>
          )}
          <label className={`absolute -bottom-1 -right-1 bg-surface p-2 rounded-full border border-outline-variant shadow-md flex items-center justify-center text-sm ${uploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:bg-surface-variant transition-colors'}`}>
            ✏️
            <input aria-label="Profile upload" type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleProfilePhotoChange} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface mb-1">Profile Picture</h2>
          <p className="text-sm text-on-surface-variant">Update your public developer avatar. This will automatically sync across the main store and dashboard.</p>
          {uploading && <div className="mt-2 text-sm text-primary font-semibold">Uploading...</div>}
        </div>
      </div>

      <form onSubmit={handleSaveProfile}>
        <div className="bg-surface-container border border-outline-variant p-8 rounded-2xl mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-2">Public Information</h2>
          <p className="text-sm text-on-surface-variant mb-6">This information will be displayed on your app listings. Email cannot be changed.</p>
          
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Developer Name * (Locked)</label>
              <input aria-label="Developer Name" type="text" value={devName} disabled className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed outline-none" title="Your personal developer name cannot be changed." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Organization / Studio Name {isFormLocked && '(Locked)'}</label>
              <input aria-label="Organization Name" type="text" value={companyName} disabled={isFormLocked} onChange={(e) => setCompanyName(e.target.value)} className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} placeholder="If provided, this overrides Developer Name publicly." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Organization Email {isFormLocked && '(Locked)'}</label>
              <input aria-label="Organization Email" type="email" value={orgEmail} disabled={isFormLocked} onChange={(e) => setOrgEmail(e.target.value)} className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} placeholder="Support email shown to users (defaults to personal email if blank)" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Personal Account Email</label>
              <input aria-label="Email Address" type="text" value={user?.email || ""} disabled className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed outline-none" />
            </div>
          </div>
        </div>

        {developerData && (
          <div className="bg-surface-container border border-outline-variant p-8 rounded-2xl mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-2">Address Details</h2>
            <p className="text-sm text-on-surface-variant mb-6">For safety and compliance, developers must provide a valid address. This is required for verification.</p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Full Address {isFormLocked && '(Locked)'}</label>
                <textarea aria-label="Full Address" rows={3} value={address} disabled={isFormLocked} onChange={(e) => setAddress(e.target.value)} required className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors resize-y ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} />
              </div>

              <div className="flex items-start gap-3 bg-surface p-4 rounded-xl border border-outline-variant mt-2">
                <input type="checkbox" id="displayAddress" checked={!addressPrivate} onChange={(e) => setAddressPrivate(!e.target.checked)} className="w-5 h-5 mt-0.5 accent-primary cursor-pointer" />
                <label htmlFor="displayAddress" className="flex flex-col cursor-pointer">
                  <strong className="text-sm text-on-surface">Display Address Publicly</strong>
                  <span className="text-xs text-on-surface-variant mt-1">If disabled, users will only see your Name, Org Name, and Email. The map is never shown to regular users.</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-10 shadow-md"
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>



      {/* Account Deletion Section */}
      <div className="bg-error-container/10 border border-error p-8 rounded-2xl mb-10 shadow-sm">
        <h2 className="text-xl font-bold text-error mb-2">Danger Zone: Delete Developer Account</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Deleting your developer account is a permanent action. You must delete all your apps from the platform before requesting deletion.
        </p>

        {deletionRequest ? (
          <div className="bg-secondary-container/20 border border-secondary-container p-6 rounded-xl">
            <h3 className="text-secondary font-bold mb-2">
              {deletionRequest.status === 'accepted' ? 'Deletion Request Accepted' : 'Deletion Request Pending'}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
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
              className="px-6 py-3 bg-surface text-on-surface border border-outline rounded-lg font-bold hover:bg-surface-variant transition-colors shadow-sm"
            >
              Cancel Deletion Request
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-on-surface">
              <strong>Current Apps:</strong> {apps.length} 
              {apps.length > 0 && <span className="text-error ml-2 font-semibold">(You must delete these first)</span>}
            </div>
            
            <textarea
              placeholder="Why are you deleting your account? (Required)"
              value={deletionReason}
              onChange={e => setDeletionReason(e.target.value)}
              disabled={apps.length > 0}
              rows={3}
              className={`w-full px-4 py-3 bg-surface border rounded-lg text-on-surface focus:border-error focus:ring-1 focus:ring-error outline-none transition-colors resize-y ${apps.length > 0 ? 'border-outline-variant opacity-50 cursor-not-allowed' : 'border-outline cursor-text'}`}
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
              className={`px-6 py-3 bg-error text-on-error rounded-lg font-bold shadow-sm w-fit transition-all ${apps.length > 0 || submittingDeletion ? 'opacity-50 cursor-not-allowed' : 'hover:bg-error-container hover:text-on-error-container cursor-pointer'}`}
            >
              {submittingDeletion ? 'Submitting...' : 'Request Account Deletion'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
