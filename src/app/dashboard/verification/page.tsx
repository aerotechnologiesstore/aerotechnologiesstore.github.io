"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateDeveloperProfile, Developer, submitVerificationRequest, updateVerificationRequest, getDeveloperVerifications, VerificationForm } from '@/lib/db';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [developerData, setDeveloperData] = useState<Developer | null>(null);
  const [devName, setDevName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [address, setAddress] = useState("");

  const [verifications, setVerifications] = useState<VerificationForm[]>([]);
  const [activeGovtId, setActiveGovtId] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [isFormLocked, setIsFormLocked] = useState(false);

  useEffect(() => {
    async function loadVerificationProfile() {
      if (!user) return;
      setDevName(user.displayName || "");

      if (userData?.role === 'developer' || userData?.role === 'admin') {
        const snap = await getDoc(doc(db, 'developers', user.uid));
        if (snap.exists()) {
          const data = snap.data() as Developer;
          setDeveloperData(data);
          setCompanyName(data.companyName || "");
          setOrgEmail(data.organizationEmail || "");
          setAddress(data.address || "");
          
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
    loadVerificationProfile();
  }, [user, userData]);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGovtId.trim()) return alert("Please enter your Government ID.");
    if (!address.trim()) return alert("Please enter your address.");
    if (!user) return;
    
    setSubmittingVerification(true);
    try {
      // Also update developer profile so they stay in sync
      if (!isFormLocked) {
        await updateDeveloperProfile(user.uid, {
          companyName: companyName,
          organizationEmail: orgEmail,
          address: address,
        });
      }

      const snapshot = {
        developerName: devName,
        companyName: companyName,
        organizationEmail: orgEmail,
        personalEmail: user?.email || '',
        address: address
      };

      if (verifications.length > 0 && verifications[0].status === 'action_required') {
        await updateVerificationRequest(verifications[0].id!, activeGovtId, snapshot);
      } else {
        await submitVerificationRequest(user.uid, activeGovtId, snapshot);
      }
      
      alert("Verification submitted successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to submit verification request.");
    }
    setSubmittingVerification(false);
  };

  if (!userData || (userData.role !== 'developer' && userData.role !== 'admin')) {
    return <div style={{ padding: '32px' }}>You must be a developer to access this page.</div>;
  }

  if (!developerData) {
    return <div style={{ padding: '32px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Verification Center</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>Apply for a blue tick to verify your identity and build trust with your users.</p>

      {verifications.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Verification History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {verifications.map(form => (
              <div key={form.id} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>ID: {form.id}</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    background: form.status === 'verified' ? 'rgba(0,255,0,0.1)' : 
                               form.status === 'rejected' ? 'rgba(255,0,0,0.1)' : 
                               form.status === 'action_required' ? 'rgba(255,179,0,0.1)' : 'rgba(255,255,255,0.1)',
                    color: form.status === 'verified' ? '#00FF00' : 
                           form.status === 'rejected' ? '#FF0000' : 
                           form.status === 'action_required' ? '#FFB300' : '#fff'
                  }}>
                    {form.status.toUpperCase()}
                  </span>
                </div>
                {form.remark && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginTop: '8px', fontSize: '14px', borderLeft: '3px solid var(--c2)' }}>
                    <strong>Admin Remark:</strong> {form.remark}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!developerData.hasVerificationBadge && 
        (!verifications.length || 
          verifications[0].status === 'rejected' || 
          verifications[0].status === 'action_required')) ? (
        
        <form onSubmit={handleSubmitVerification} className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--c1)' }}>
            {verifications.length > 0 && verifications[0].status === 'action_required' ? 'Action Required: Edit Application' : 'Submit New Application'}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Personal Name (Locked)</label>
              <input type="text" value={devName} disabled style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' }} />
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Cannot be edited.</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Personal Email (Locked)</label>
              <input type="email" value={user?.email || ""} disabled style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' }} />
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Cannot be edited.</div>
            </div>

            <hr style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Organization / Studio Name {isFormLocked && '(Locked)'}</label>
              <input type="text" value={companyName} disabled={isFormLocked} onChange={(e) => setCompanyName(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: isFormLocked ? 'transparent' : 'rgba(255,255,255,0.05)', border: isFormLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: isFormLocked ? 'rgba(255,255,255,0.5)' : '#fff', cursor: isFormLocked ? 'not-allowed' : 'text', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Organization Email {isFormLocked && '(Locked)'}</label>
              <input type="email" value={orgEmail} disabled={isFormLocked} onChange={(e) => setOrgEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: isFormLocked ? 'transparent' : 'rgba(255,255,255,0.05)', border: isFormLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: isFormLocked ? 'rgba(255,255,255,0.5)' : '#fff', cursor: isFormLocked ? 'not-allowed' : 'text', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Full Address {isFormLocked && '(Locked)'}</label>
              <textarea rows={3} value={address} disabled={isFormLocked} onChange={(e) => setAddress(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: isFormLocked ? 'transparent' : 'rgba(255,255,255,0.05)', border: isFormLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: isFormLocked ? 'rgba(255,255,255,0.5)' : '#fff', resize: 'vertical', cursor: isFormLocked ? 'not-allowed' : 'text', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>Government Document ID Number {isFormLocked && '(Locked)'}</label>
              <input type="text" value={activeGovtId} disabled={isFormLocked} onChange={(e) => setActiveGovtId(e.target.value)} required placeholder="Masked Aadhaar Number, PAN, Passport, etc." style={{ width: '100%', padding: '12px 16px', background: isFormLocked ? 'transparent' : 'rgba(255,255,255,0.05)', border: isFormLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: isFormLocked ? 'rgba(255,255,255,0.5)' : '#fff', cursor: isFormLocked ? 'not-allowed' : 'text', outline: 'none' }} />
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>Required for manual verification by Admin.</div>
            </div>
          </div>

          {!isFormLocked && (
            <button
              type="submit"
              disabled={submittingVerification}
              className="btn-glass btn-glass-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px', cursor: submittingVerification ? 'wait' : 'pointer' }}
            >
              {submittingVerification ? 'Submitting...' : 'Submit Verification Form'}
            </button>
          )}
        </form>
      ) : developerData.hasVerificationBadge ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(0,255,0,0.3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', color: '#00FF00', marginBottom: '8px' }}>You are Verified!</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Your account has the Aero Tick. Users can trust your applications.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Application Pending</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Your verification application has been submitted and is currently locked pending review by an Admin.</p>
        </div>
      )}
    </div>
  );
}
