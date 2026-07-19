"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signUpDeveloper, upgradeToDeveloper, loginWithGoogle, loginWithGithub, loginWithFacebook, loginWithMicrosoft, loginWithYahoo, logoutUser } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import "../../auth.css";

const THEMES = [
  { bg:'#080400', bg2:'#100800', surface:'#1a0c00', surface2:'#221000', c1:'#FF2D00', c2:'#FF6B00', c3:'#FFB300', border:'rgba(255,107,0,0.15)', glow:'rgba(255,107,0,0.2)', logo:'/logos/logo-orange-v2.png', logoHue: '0deg' },
  { bg:'#000810', bg2:'#001020', surface:'#001428', surface2:'#001a33', c1:'#00A3FF', c2:'#00D4FF', c3:'#7DF9FF', border:'rgba(0,163,255,0.15)', glow:'rgba(0,163,255,0.2)', logo:'/logos/logo-blue-v2.png', logoHue: '190deg' },
  { bg:'#0a0018', bg2:'#120020', surface:'#1a0830', surface2:'#220e3a', c1:'#8B5CF6', c2:'#A78BFA', c3:'#DDD6FE', border:'rgba(139,92,246,0.15)', glow:'rgba(139,92,246,0.2)', logo:'/logos/logo-purple-v2.png', logoHue: '260deg' },
  { bg:'#100400', bg2:'#180800', surface:'#201000', surface2:'#2a1400', c1:'#FF4500', c2:'#FF8C00', c3:'#FFD700', border:'rgba(255,140,0,0.15)', glow:'rgba(255,140,0,0.2)', logo:'/logos/logo-rocket-v2.png', logoHue: '45deg' },
];

function applyTheme(t: typeof THEMES[0]) {
  const r = document.documentElement;
  r.style.setProperty('--bg',t.bg); r.style.setProperty('--bg2',t.bg2);
  r.style.setProperty('--surface',t.surface); r.style.setProperty('--surface2',t.surface2);
  r.style.setProperty('--c1',t.c1); r.style.setProperty('--c2',t.c2); r.style.setProperty('--c3',t.c3);
  r.style.setProperty('--border',t.border); r.style.setProperty('--glow',t.glow);
}

export default function DeveloperRegisterPage() {
  const router = useRouter();
  const { user, userData } = useAuth();

  // If user is already logged in, we show the upgrade form (no email/password needed)
  const isUpgrade = !!user;
  
  // Account details (only needed for new registration)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Developer details (always needed)
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
  const [logoSrc, setLogoSrc] = useState(THEMES[0].logo);

  const cycle = useCallback(() => {
    setLogoSrc((prev) => {
      const idx = THEMES.findIndex(t => t.logo === prev);
      const next = (idx + 1) % THEMES.length;
      applyTheme(THEMES[next]);
      return THEMES[next].logo;
    });
  }, []);

  useEffect(() => {
    applyTheme(THEMES[0]);
    const i = setInterval(cycle, 8000);
    return () => clearInterval(i);
  }, [cycle]);

  // If user is already a developer, redirect to dashboard
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
    <div className="auth-page" onContextMenu={e => e.preventDefault()}>
      <div className="auth-card wide">
        <img className="auth-logo" src={logoSrc} alt="Aero Store" draggable={false} />
        <div className="auth-title">{isUpgrade ? "Upgrade to Developer" : "Developer Registration"}</div>
        <div className="auth-subtitle">
          {isUpgrade 
            ? `Welcome back, ${userData?.displayName || user?.displayName}! Fill in your developer details below.`
            : "Publish apps to millions of users in India"
          }
        </div>

        {isUpgrade && (
          <div className="auth-info-box" style={{ borderColor: 'var(--c2)' }}>
            <p>✅ You are already signed in as <strong>{user?.email}</strong>. We just need your developer details to upgrade your account.</p>
          </div>
        )}

        <div className="auth-info-box">
          <p><strong>Note:</strong> All developers must undergo identity and address verification to prevent malware and protect users. You can complete the document upload from your dashboard later.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form method="POST" className="auth-form" onSubmit={handleRegister}>
          
          {!isUpgrade && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="field-1">Full Name</label>
                  <input id="field-1" className="auth-input" type="text" placeholder="Your name" aria-label="Your name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="field-2">Email Address</label>
                  <input id="field-2" className="auth-input" type="email" placeholder="dev@example.com" aria-label="dev@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="field-3">Password</label>
                  <input id="field-3" className="auth-input" type="password" placeholder="Minimum 8 characters" aria-label="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>
            </>
          )}

          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="field-4">Company / Studio Name</label>
                  <input id="field-4" className="auth-input" type="text" placeholder="Studio name" aria-label="Studio name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="field-5">Phone Number</label>
                  <input id="field-5" className="auth-input" type="tel" placeholder="+91" aria-label="+91" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="field-6">PIN Code (6 Digits)</label>
                  <input id="field-6" className="auth-input" type="text" placeholder="Enter PIN to fetch City/State" aria-label="Enter PIN to fetch City/State" value={pincode} onChange={e => handlePincodeChange(e.target.value)} required maxLength={6} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="field-7">Street Address</label>
                  <input id="field-7" className="auth-input" type="text" placeholder="Building, Street name" aria-label="Building, Street name" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="field-8">City / District (Auto-filled)</label>
                  <input id="field-8" className="auth-input" type="text" placeholder="Auto-filled via PIN Code" aria-label="Auto-filled via PIN Code" value={city} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} required />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="field-9">State (Auto-filled)</label>
                  <input id="field-9" className="auth-input" type="text" placeholder="Auto-filled via PIN Code" aria-label="Auto-filled via PIN Code" value={state} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} required />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface2)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '16px' }}>
            <input type="checkbox" checked={addressPrivate} onChange={(e) => setAddressPrivate(e.target.checked)} id="addressPrivate" style={{ width: '20px', height: '20px', accentColor: 'var(--c1)' }} />
            <label htmlFor="addressPrivate" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
              Hide address from public (Users will only see 'Address Verified')
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreedToTerms} 
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked) setError("");
              }}
              style={{ accentColor: 'var(--c2)', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="terms" style={{ cursor: 'pointer' }}>
              I agree to the <a href="/terms/" style={{ color: 'var(--c2)', textDecoration: 'none' }}>Terms & Conditions</a> and <a href="/privacy/" style={{ color: 'var(--c2)', textDecoration: 'none' }}>Privacy Policy</a>
            </label>
          </div>

          <button className="auth-submit" type="submit" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? "Processing..." : (isUpgrade ? "Upgrade to Developer" : "Create Developer Account")}
          </button>
          
          <div className="auth-divider"><span>or continue with</span></div>

          <button className="auth-google" type="button" onClick={() => handleOAuth('Google', loginWithGoogle)} disabled={loading}>
            <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>

          <div className="grid-1-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
            <button type="button" onClick={() => handleOAuth('GitHub', loginWithGithub)} disabled={loading} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }} title="GitHub">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </button>
            <button type="button" onClick={() => handleOAuth('Yahoo', loginWithYahoo)} disabled={loading} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }} title="Yahoo">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#6001D2"><path d="M17.478 2.054 12 10.916 6.522 2.054H1.3l8.037 12.585v7.307h5.326v-7.307L22.7 2.054h-5.222z"/></svg>
            </button>
          </div>
        </form>

        {!isUpgrade && (
          <div className="auth-footer" style={{ marginTop: 24 }}>
            Already a developer? <a href="/login/">Sign in</a>
          </div>
        )}
      </div>
    </div>
  );
}
