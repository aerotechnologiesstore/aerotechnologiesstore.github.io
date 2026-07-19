"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle, loginWithGithub, loginWithFacebook, loginWithMicrosoft, loginWithYahoo, logoutUser } from "@/lib/auth";
import { sendEmailVerification } from "firebase/auth";
import "../auth.css";




export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const logoSrc = '/logos/logo-blue-v2.png';

  

  

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy to sign in.");
      return;
    }
    setError("");
    setLoading(true);
    setNeedsVerification(false);
    try {
      const user = await loginWithEmail(email, password);
      if (!user.emailVerified) {
        await logoutUser();
        setError("Your email is not verified. Please check your inbox and click the verification link.");
        setNeedsVerification(true);
        setLoading(false);
        return;
      }
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("user-not-found")) setError("No account found with this email.");
      else if (message.includes("wrong-password") || message.includes("invalid-credential")) setError("Incorrect password. Please try again.");
      else if (message.includes("too-many-requests")) setError("Too many attempts. Please wait a few minutes.");
      else setError("Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const user = await loginWithEmail(email, password);
      await sendEmailVerification(user);
      await logoutUser();
      alert("Verification email resent! Please check your inbox (and spam folder).");
    } catch (err) {
      alert("Failed to resend verification email. Please try logging in again.");
    }
    setLoading(false);
  };

  const handleOAuth = async (providerName: string, loginFn: () => Promise<any>) => {
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy to sign in.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await loginFn();
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `${providerName} sign-in failed`;
      if (message.includes("popup-closed")) setError("Sign-in popup was closed.");
      else setError(`${providerName} sign-in failed: ${message}`);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" onContextMenu={e => e.preventDefault()}>
      <div className="auth-card">
        <img className="auth-logo" src={logoSrc} alt="Aero Store" draggable={false} />
        <div className="auth-title">Welcome Back</div>
        <div className="auth-subtitle">Sign in to your Aero Store account</div>

        {error && <div className="auth-error">{error}</div>}

        <form method="POST" className="auth-form" onSubmit={handleEmailLogin}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="field-1">Email</label>
                  <input id="field-1"
              className="auth-input"
              type="email"
              placeholder="you@example.com" aria-label="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="field-2">Password</label>
                  <input id="field-2"
              className="auth-input"
              type="password"
              placeholder="••••••••" aria-label="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {needsVerification && (
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={loading}
              style={{ marginTop: '12px', background: 'transparent', border: '1px solid var(--c2)', color: 'var(--c2)', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
            >
              Resend Verification Email
            </button>
          )}

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

        <div className="auth-footer">
          Don&apos;t have an account? <a href="/register/">Create one</a>
        </div>
      </div>
    </div>
  );
}
