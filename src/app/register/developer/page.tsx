"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signUpDeveloper, upgradeToDeveloper, loginWithGoogle, loginWithGithub, loginWithFacebook, loginWithMicrosoft, loginWithYahoo, logoutUser } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function DeveloperRegisterPage() {
  const router = useRouter();
  const { user, userData } = useAuth();

  const isUpgrade = !!user;
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressPrivate, setAddressPrivate] = useState(false);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const logoSrc = '/logos/logo-main.png';

  useEffect(() => {
    if (userData?.role === 'developer' || userData?.role === 'admin') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    if (val.length === 6 && /^\d+$/.test(val)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setState(postOffice.State || "");
          setCity(postOffice.District || postOffice.Region || "");
        } else {
          setState("");
          setCity("");
        }
      } catch (e) {
        console.error("Failed to fetch pincode details", e);
      }
    } else {
      setState("");
      setCity("");
    }
  };

  const handleOAuth = async (providerName: string, loginFn: () => Promise<any>) => {
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await loginFn();
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `${providerName} sign-up failed`;
      if (message.includes("popup-closed")) setError("Sign-in popup was closed.");
      else setError(`${providerName} sign-in failed: ${message}`);
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    setError("");

    if (companyName.trim().length < 2) {
      setError("Please enter a valid company/studio name.");
      return;
    }
    if (!city || !state) {
      setError("Please enter a valid 6-digit PIN Code to fetch City and State.");
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${address}, ${city}, ${state} - ${pincode}, Phone: ${phone}`;

      if (isUpgrade) {
        await upgradeToDeveloper(companyName.trim(), fullAddress, addressPrivate);
        router.push("/dashboard");
      } else {
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          setLoading(false);
          return;
        }
        if (name.trim().length < 2) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        await signUpDeveloper(email, password, name.trim(), companyName.trim(), fullAddress, addressPrivate);
        await logoutUser();
        alert("Registration successful! A verification link has been sent to your email. Please verify before logging in.");
        router.push("/login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.includes("email-already-in-use")) setError("This email is already registered. Please log in first, then upgrade to developer from your Profile page.");
      else setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden" onContextMenu={e => e.preventDefault()}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,var(--glow)_0%,transparent_70%)] pointer-events-none opacity-20"></div>
      
      <div className="w-full max-w-2xl bg-surface-container-low/80 backdrop-blur-2xl border border-outline-variant rounded-[32px] p-8 md:p-10 relative shadow-2xl z-10 my-10">
        <img className="w-16 h-16 rounded-2xl object-cover block mx-auto mb-6 shadow-[0_0_32px_var(--glow)]" src={logoSrc} alt="Aero Store" draggable={false} />
        
        <h1 className="font-display-lg text-3xl font-bold text-center text-on-surface mb-2">{isUpgrade ? "Upgrade to Developer" : "Developer Registration"}</h1>
        <p className="font-body-md text-on-surface-variant text-center mb-8">
          {isUpgrade 
            ? `Welcome back, ${userData?.displayName || user?.displayName}! Fill in your developer details below.`
            : "Publish apps to millions of users in India"
          }
        </p>

        {isUpgrade && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 font-body-sm text-on-surface">
            ✅ You are already signed in as <strong className="text-primary">{user?.email}</strong>. We just need your developer details to upgrade your account.
          </div>
        )}

        <div className="bg-surface-variant border border-outline-variant rounded-xl p-4 mb-8 font-body-sm text-on-surface-variant leading-relaxed">
          <strong>Note:</strong> All developers must undergo identity and address verification to prevent malware and protect users. You can complete the document upload from your dashboard later.
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 font-body-sm text-red-400">{error}</div>}

        <form method="POST" className="flex flex-col gap-5" onSubmit={handleRegister}>
          
          {!isUpgrade && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-1">Full Name</label>
                  <input id="field-1" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md" type="text" placeholder="Your name" aria-label="Your name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-2">Email Address</label>
                  <input id="field-2" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md" type="email" placeholder="dev@example.com" aria-label="dev@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-3">Password</label>
                <input id="field-3" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md" type="password" placeholder="Minimum 8 characters" aria-label="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-4">Company / Studio Name</label>
              <input id="field-4" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md" type="text" placeholder="Studio name" aria-label="Studio name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-5">Phone Number</label>
              <input id="field-5" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md" type="tel" placeholder="+91" aria-label="+91" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-6">PIN Code (6 Digits)</label>
              <input id="field-6" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md" type="text" placeholder="Enter PIN to fetch City/State" aria-label="Enter PIN to fetch City/State" value={pincode} onChange={e => handlePincodeChange(e.target.value)} required maxLength={6} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-7">Street Address</label>
            <input id="field-7" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md" type="text" placeholder="Building, Street name" aria-label="Building, Street name" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-8">City / District (Auto-filled)</label>
              <input id="field-8" className="px-4 py-3 bg-surface-variant border border-outline-variant rounded-xl text-on-surface-variant cursor-not-allowed font-body-md opacity-70" type="text" placeholder="Auto-filled via PIN Code" aria-label="Auto-filled via PIN Code" value={city} readOnly required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-9">State (Auto-filled)</label>
              <input id="field-9" className="px-4 py-3 bg-surface-variant border border-outline-variant rounded-xl text-on-surface-variant cursor-not-allowed font-body-md opacity-70" type="text" placeholder="Auto-filled via PIN Code" aria-label="Auto-filled via PIN Code" value={state} readOnly required />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-variant p-4 rounded-xl border border-outline-variant mt-2">
            <input type="checkbox" checked={addressPrivate} onChange={(e) => setAddressPrivate(e.target.checked)} id="addressPrivate" className="w-5 h-5 accent-primary rounded cursor-pointer shrink-0" />
            <label htmlFor="addressPrivate" className="font-body-sm text-on-surface-variant cursor-pointer leading-tight">
              Hide address from public (Users will only see 'Address Verified')
            </label>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <input 
              type="checkbox" 
              id="terms" 
              className="w-5 h-5 accent-primary rounded cursor-pointer shrink-0"
              checked={agreedToTerms} 
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked) setError("");
              }}
            />
            <label htmlFor="terms" className="font-body-sm text-on-surface-variant cursor-pointer">
              I agree to the <a href="/terms/" className="text-primary hover:underline">Terms & Conditions</a> and <a href="/privacy/" className="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" disabled={loading} className="mt-4 w-full py-4 bg-primary text-on-primary rounded-xl font-bold font-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 shadow-sm">
            {loading ? "Processing..." : (isUpgrade ? "Upgrade to Developer" : "Create Developer Account")}
          </button>
          
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-outline-variant"></div>
            <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-outline-variant"></div>
          </div>

          <button type="button" onClick={() => handleOAuth('Google', loginWithGoogle)} disabled={loading} className="w-full py-3.5 bg-surface border border-outline-variant text-on-surface rounded-xl font-bold font-label-lg flex items-center justify-center gap-3 hover:bg-surface-variant transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button type="button" onClick={() => handleOAuth('GitHub', loginWithGithub)} disabled={loading} className="py-3 bg-surface border border-outline-variant rounded-xl flex items-center justify-center hover:bg-surface-variant transition-colors" title="GitHub">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-on-surface"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </button>
            <button type="button" onClick={() => handleOAuth('Yahoo', loginWithYahoo)} disabled={loading} className="py-3 bg-surface border border-outline-variant rounded-xl flex items-center justify-center hover:bg-surface-variant transition-colors" title="Yahoo">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#6001D2"><path d="M17.478 2.054 12 10.916 6.522 2.054H1.3l8.037 12.585v7.307h5.326v-7.307L22.7 2.054h-5.222z"/></svg>
            </button>
          </div>
        </form>

        {!isUpgrade && (
          <div className="text-center mt-8 font-body-sm text-on-surface-variant">
            Already a developer? <a href="/login/" className="text-primary font-bold hover:underline">Sign in</a>
          </div>
        )}
      </div>
    </div>
  );
}
