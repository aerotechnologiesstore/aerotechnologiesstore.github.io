"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateDeveloperProfile, Developer, submitVerificationRequest, updateVerificationRequest, getDeveloperVerifications, VerificationForm } from '@/lib/db';
import { uploadGovtIdDocument } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [developerData, setDeveloperData] = useState<Developer | null>(null);
  const [devName, setDevName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  const [verifications, setVerifications] = useState<VerificationForm[]>([]);
  const [idType, setIdType] = useState("Aadhaar");
  const [isMaskedAadhaar, setIsMaskedAadhaar] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
          
          // Try to parse existing address if we want, but it's complex. Let's just set local address to the full string if we can't parse it.
          const existingAddress = data.address || "";
          const pinMatch = existingAddress.match(/- (\d{6})$/);
          if (pinMatch) {
             setPincode(pinMatch[1]);
             setLocalAddress(existingAddress.replace(/, [^,]+, [^,]+ - \d{6}$/, ''));
          } else {
             setLocalAddress(existingAddress);
          }
          
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
            const parts = actionRequiredForm.govtId.split(" - ");
            if (parts.length === 2) {
              setIdType(parts[0]);
              setIdNumber(parts[1]);
            } else {
              setIdNumber(actionRequiredForm.govtId);
            }
          }
        } else {
          setDeveloperData({
            companyName: "",
            organizationEmail: "",
            address: "",
            addressPrivate: false,
            hasVerificationBadge: false,
            verificationStatus: 'unverified',
            totalApps: 0,
            createdAt: 0
          });
        }
      }
    }
    loadVerificationProfile();
  }, [user, userData]);

  useEffect(() => {
    if (pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setCity(postOffice.District);
            setStateName(postOffice.State);
          } else {
            setCity("");
            setStateName("");
          }
        })
        .catch(err => console.error(err));
    } else {
      setCity("");
      setStateName("");
    }
  }, [pincode]);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localAddress.trim()) return alert("Please enter your local address.");
    if (!pincode.trim() || pincode.length !== 6 || !city || !stateName) return alert("Please enter a valid 6-digit Pincode.");
    if (!idNumber.trim()) return alert("Please enter your Government ID number.");
    
    // Exact validation before submission
    if (idType === 'Aadhaar' && !isMaskedAadhaar && idNumber.length !== 14) {
       return alert("Aadhaar number must be exactly 12 digits (format: XXXX-XXXX-XXXX).");
    }
    if (idType === 'Aadhaar' && isMaskedAadhaar && idNumber.length !== 4) {
       return alert("For Masked Aadhaar, please enter exactly the LAST 4 digits.");
    }
    if (idType === 'PAN' && idNumber.length !== 10) {
       return alert("PAN must be exactly 10 characters (5 letters, 4 numbers, 1 letter).");
    }
    if (idType === 'Passport' && idNumber.length !== 8) {
       return alert("Passport must be exactly 8 characters (1 letter, 7 numbers).");
    }
    
    if (idType === 'Aadhaar' && isMaskedAadhaar && !isFormLocked && !idDocumentFile && (!verifications.length || verifications[0].status !== 'action_required')) {
      return alert("Please upload a scanned copy of your Masked Aadhaar.");
    }
    
    if (!user) return;
    
    const fullAddress = `${localAddress.trim()}, ${city}, ${stateName} - ${pincode}`;
    const fullGovtId = idType === 'Aadhaar' && isMaskedAadhaar 
      ? `Masked Aadhaar - ${idNumber.trim().toUpperCase()}` 
      : `${idType} - ${idNumber.trim().toUpperCase()}`;
    
    setSubmittingVerification(true);
    setUploadProgress(0);
    
    try {
      let uploadedUrl = "";
      if (idDocumentFile) {
        uploadedUrl = await uploadGovtIdDocument(idDocumentFile, user.uid, (event) => {
          setUploadProgress(event.progress);
        });
      }

      // Also update developer profile so they stay in sync
      if (!isFormLocked) {
        await updateDeveloperProfile(user.uid, {
          companyName: companyName,
          organizationEmail: orgEmail,
          address: fullAddress,
        });
      }

      const snapshot: any = {
        developerName: devName,
        companyName: companyName,
        organizationEmail: orgEmail,
        personalEmail: user?.email || '',
        address: fullAddress
      };
      
      if (uploadedUrl) {
        snapshot.govtIdUrl = uploadedUrl;
      }

      if (verifications.length > 0 && verifications[0].status === 'action_required') {
        await updateVerificationRequest(verifications[0].id!, fullGovtId, snapshot);
      } else {
        await submitVerificationRequest(user.uid, fullGovtId, snapshot);
      }
      
      alert("Verification submitted successfully!");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit verification request. Error: " + (err.message || "Unknown error"));
    }
    setSubmittingVerification(false);
  };

  if (!userData || (userData.role !== 'developer' && userData.role !== 'admin')) {
    return <div className="p-8 text-on-surface">You must be a developer to access this page.</div>;
  }

  if (!developerData) {
    return <div className="p-8 text-on-surface">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-2 text-on-surface">Verification Center</h1>
      <p className="text-on-surface-variant mb-8">Apply for a blue tick to verify your identity and build trust with your users.</p>

      {verifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-on-surface mb-3">Verification History</h3>
          <div className="flex flex-col gap-3">
            {verifications.map(form => (
              <div key={form.id} className="bg-surface-container border border-outline-variant p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-on-surface-variant">ID: {form.id}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${form.status === 'verified' ? 'bg-success-green/20 text-success-green' : form.status === 'rejected' ? 'bg-error-container text-on-error-container' : form.status === 'action_required' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface'}`}>
                    {form.status.toUpperCase()}
                  </span>
                </div>
                {form.remark && (
                  <div className="bg-surface p-3 rounded-lg mt-2 text-sm text-on-surface border-l-4 border-primary shadow-sm">
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
        
        <form onSubmit={handleSubmitVerification} className="bg-surface-container border border-outline-variant p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-primary">
            {verifications.length > 0 && verifications[0].status === 'action_required' ? 'Action Required: Edit Application' : 'Submit New Application'}
          </h2>
          
          <div className="flex flex-col gap-5 mb-8">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Personal Name (Locked)</label>
              <input type="text" value={devName} disabled className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed" />
              <div className="text-xs text-on-surface-variant mt-1">Cannot be edited.</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Personal Email (Locked)</label>
              <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed" />
              <div className="text-xs text-on-surface-variant mt-1">Cannot be edited.</div>
            </div>

            <hr className="border-outline-variant my-2" />

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Organization / Studio Name {isFormLocked && '(Locked)'}</label>
              <input type="text" value={companyName} disabled={isFormLocked} onChange={(e) => setCompanyName(e.target.value)} className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Organization Email {isFormLocked && '(Locked)'}</label>
              <input type="email" value={orgEmail} disabled={isFormLocked} onChange={(e) => setOrgEmail(e.target.value)} className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Local Address {isFormLocked && '(Locked)'}</label>
              <textarea rows={2} value={localAddress} disabled={isFormLocked} onChange={(e) => setLocalAddress(e.target.value)} required placeholder="Street, Building, Area" className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors resize-y ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Pincode {isFormLocked && '(Locked)'}</label>
                <input type="text" maxLength={6} value={pincode} disabled={isFormLocked} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} required placeholder="6-digit Pincode" className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">State</label>
                <input type="text" value={stateName} disabled placeholder="Auto-filled" className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">City</label>
                <input type="text" value={city} disabled placeholder="Auto-filled" className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Government ID Type {isFormLocked && '(Locked)'}</label>
                <select value={idType} disabled={isFormLocked} onChange={(e) => {
                  setIdType(e.target.value);
                  setIdNumber(""); // reset on change
                }} className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer'}`}>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              {idType === 'Aadhaar' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-on-surface mb-2">Aadhaar Card Type {isFormLocked && '(Locked)'}</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="aadhaarType"
                        checked={!isMaskedAadhaar} 
                        disabled={isFormLocked}
                        onChange={() => {
                          setIsMaskedAadhaar(false);
                          setIdNumber("");
                        }}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-on-surface">Normal Aadhaar</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="aadhaarType"
                        checked={isMaskedAadhaar} 
                        disabled={isFormLocked}
                        onChange={() => {
                          setIsMaskedAadhaar(true);
                          setIdNumber("");
                        }}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-on-surface">Masked Aadhaar</span>
                    </label>
                  </div>
                </div>
              )}
              
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-on-surface mb-2">ID Number {isFormLocked && '(Locked)'}</label>
                <input 
                  type="text" 
                  maxLength={idType === 'Aadhaar' && !isMaskedAadhaar ? 14 : idType === 'Aadhaar' && isMaskedAadhaar ? 4 : idType === 'PAN' ? 10 : 8}
                  value={idNumber} 
                  disabled={isFormLocked} 
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase();
                    if (idType === 'Aadhaar' && !isMaskedAadhaar) {
                      val = val.replace(/\D/g, ''); // Only numbers for Aadhaar
                      val = val.slice(0, 12);
                      // Format as XXXX-XXXX-XXXX
                      val = val.replace(/(\d{4})(?=\d)/g, '$1-');
                    } else if (idType === 'Aadhaar' && isMaskedAadhaar) {
                      val = val.replace(/\D/g, ''); // Only numbers
                      val = val.slice(0, 4); // Only last 4 digits
                    } else if (idType === 'PAN') {
                      let clean = "";
                      for (let i = 0; i < val.length && i < 10; i++) {
                        const char = val[i];
                        if (i < 5 && /[A-Z]/.test(char)) clean += char;
                        else if (i >= 5 && i < 9 && /[0-9]/.test(char)) clean += char;
                        else if (i === 9 && /[A-Z]/.test(char)) clean += char;
                      }
                      val = clean;
                    } else {
                      let clean = "";
                      for (let i = 0; i < val.length && i < 8; i++) {
                        const char = val[i];
                        if (i === 0 && /[A-Z]/.test(char)) clean += char;
                        else if (i > 0 && /[0-9]/.test(char)) clean += char;
                      }
                      val = clean;
                    }
                    setIdNumber(val);
                  }} 
                  required 
                  placeholder={idType === 'Aadhaar' && !isMaskedAadhaar ? "XXXX-XXXX-XXXX" : idType === 'Aadhaar' && isMaskedAadhaar ? "Last 4 Digits" : `Enter your ${idType} Number`} 
                  className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${isFormLocked ? 'bg-surface border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-text'}`} 
                />
                <div className="text-xs text-on-surface-variant mt-2">Required for manual verification by Admin. Format is strictly validated as you type.</div>
              </div>
            </div>

            {idType === 'Aadhaar' && isMaskedAadhaar && (
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Upload Masked Aadhaar Document {isFormLocked && '(Locked)'}</label>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, application/pdf"
                  disabled={isFormLocked}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIdDocumentFile(e.target.files[0]);
                    }
                  }}
                  className={`w-full px-4 py-3 bg-surface border rounded-lg text-on-surface-variant transition-colors ${isFormLocked ? 'border-outline-variant cursor-not-allowed' : 'border-outline focus:border-primary cursor-pointer'}`}
                />
                <div className="text-xs text-on-surface-variant mt-2">Please upload a clear scan of your Masked Aadhaar (Max 5MB). Images or PDFs allowed.</div>
              </div>
            )}
          </div>

          {!isFormLocked && (
            <button
              type="submit"
              disabled={submittingVerification}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md relative overflow-hidden"
            >
              {submittingVerification && uploadProgress > 0 && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-primary-container/30 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              )}
              <span className="relative z-10">
                {submittingVerification ? (uploadProgress > 0 ? `Uploading Document (${Math.round(uploadProgress)}%)...` : 'Submitting...') : 'Submit Verification Form'}
              </span>
            </button>
          )}
        </form>
      ) : developerData.hasVerificationBadge ? (
        <div className="bg-success-green/10 border border-success-green/30 p-10 text-center rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-success-green mb-2">You are Verified!</h2>
          <p className="text-on-surface-variant">Your account has the Aero Tick. Users can trust your applications.</p>
        </div>
      ) : (
        <div className="bg-surface-container border border-outline-variant p-10 text-center rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-2">Application Pending</h2>
          <p className="text-on-surface-variant">Your verification application has been submitted and is currently locked pending review by an Admin.</p>
        </div>
      )}
    </div>
  );
}
