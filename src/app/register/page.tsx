"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signUpUser, loginWithGoogle, loginWithGithub, loginWithFacebook, loginWithMicrosoft, loginWithYahoo, logoutUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const logoSrc = '/logos/logo-main.png';
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      await signUpUser(email, password, name.trim());
      await logoutUser();
      alert("Registration successful! A verification link has been sent to your email. Please verify before logging in.");
      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.includes("email-already-in-use")) setError("This email is already registered. Try logging in.");
      else if (message.includes("weak-password")) setError("Password is too weak. Use at least 8 characters.");
      else if (message.includes("invalid-email")) setError("Please enter a valid email address.");
      else setError("Registration failed. Please try again.");
    }
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden" onContextMenu={e => e.preventDefault()}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,var(--glow)_0%,transparent_70%)] pointer-events-none opacity-20"></div>
      
      <div className="w-full max-w-md bg-surface-container-low/80 backdrop-blur-2xl border border-outline-variant rounded-[32px] p-8 md:p-10 relative shadow-2xl z-10">
        <img className="w-16 h-16 rounded-2xl object-cover block mx-auto mb-6 shadow-[0_0_32px_var(--glow)]" src={logoSrc} alt="Aero Store" draggable={false} />
        
        <h1 className="font-display-lg text-3xl font-bold text-center text-on-surface mb-2">Create Account</h1>
        <p className="font-body-md text-on-surface-variant text-center mb-8">Join the Aero Store platform</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 font-body-sm text-red-400">{error}</div>}

        <form method="POST" className="flex flex-col gap-5" onSubmit={handleRegister}>
          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-1">Full Name</label>
            <input id="field-1"
              className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md"
              type="text"
              placeholder="Your full name" aria-label="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-2">Email</label>
            <input id="field-2"
              className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md"
              type="email"
              placeholder="you@example.com" aria-label="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-3">Password</label>
            <input id="field-3"
              className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md"
              type="password"
              placeholder="Minimum 8 characters" aria-label="Minimum 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="field-4">Confirm Password</label>
            <input id="field-4"
              className="px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md"
              type="password"
              placeholder="Re-enter password" aria-label="Re-enter password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <input 
              type="checkbox" 
              id="terms" 
              className="w-5 h-5 accent-primary rounded cursor-pointer"
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
            {loading ? "Creating account..." : "Create Account"}
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

        <div className="text-center mt-8 font-body-sm text-on-surface-variant">
          Already have an account? <a href="/login/" className="text-primary font-bold hover:underline">Sign in</a>
        </div>
        <div className="text-center mt-3 font-body-sm text-on-surface-variant">
          Want to publish apps? <a href="/register/developer/" className="text-primary font-bold hover:underline">Register as Developer</a>
        </div>
      </div>
    </div>
  );
}
