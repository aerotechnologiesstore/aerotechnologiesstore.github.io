"use client";
import Link from 'next/link';
import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-16 px-6 relative overflow-hidden" onContextMenu={e => e.preventDefault()}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,var(--glow)_0%,transparent_70%)] pointer-events-none opacity-10"></div>
      
      <div className="w-full max-w-4xl relative z-10">
        <Link href="/" className="text-primary font-bold hover:underline inline-flex items-center gap-2 mb-10">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="font-label-lg text-primary uppercase tracking-widest mb-4">Legal</div>
          <h1 className="font-display-lg text-4xl md:text-6xl font-bold text-on-surface mb-6">
            Privacy <span className="bg-gradient-to-r from-primary to-primary-container text-transparent bg-clip-text">Policy</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Last updated: July 15, 2026
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-8 mb-12 text-center text-on-surface-variant font-body-lg leading-relaxed shadow-lg">
          At Aero Store, your privacy isn&apos;t a feature — it&apos;s a foundation. This document
          explains how we collect, use, and protect your data across all Aero Store products and services.
        </div>

        <div className="flex flex-col gap-12">
          
          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">01</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">🔐</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Data We Collect</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>We collect only the minimum data required to operate our platform. This includes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-on-surface">Account Information</strong> — Name, email address, and phone number during registration.</li>
                <li><strong className="text-on-surface">Download History</strong> — We securely track apps you download to maintain a personalized history log and for administrative oversight.</li>
                <li><strong className="text-on-surface">Developer Verification</strong> — Address proof and identity documents (for developer accounts only).</li>
                <li><strong className="text-on-surface">Usage Analytics</strong> — Anonymous interaction data to improve platform performance. No personal identifiers are attached.</li>
                <li><strong className="text-on-surface">Device Information</strong> — Basic device type and OS version to ensure app compatibility.</li>
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">02</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">🛡️</div>
              <h2 className="font-headline-lg font-bold text-on-surface">How We Protect Your Data</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>All user data is <strong className="text-primary">encrypted at rest and in transit</strong> using AES-256 and TLS 1.3. We follow industry best practices:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-on-surface">Smart Storage Architecture</strong> — For maximum security and speed, all personal data, app icons, banners, and government IDs are securely stored in our highly-secured private storage environment. Only public APK installation files are routed to our decentralized public download servers to ensure unlimited, fast public downloading.</li>
                <li>All data is hosted on <strong className="text-on-surface">Indian cloud servers</strong> — region-locked and never transferred abroad.</li>
                <li>Developer verification documents are <strong className="text-on-surface">auto-purged after 90 days</strong> of account verification.</li>
                <li>Inactive user accounts have their data <strong className="text-on-surface">automatically purged after 12 months</strong> of inactivity.</li>
                <li>We maintain <strong className="text-on-surface">zero-knowledge architecture</strong> where possible — we can&apos;t read what we don&apos;t store.</li>
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">03</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">🚫</div>
              <h2 className="font-headline-lg font-bold text-on-surface">What We Never Do</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>This is our <strong className="text-primary">iron-clad guarantee</strong> to every user on the platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We <strong className="text-red-400">never sell</strong> your personal data to third parties. Ever.</li>
                <li>We <strong className="text-red-400">never serve targeted ads</strong> based on your personal information.</li>
                <li>We <strong className="text-red-400">never share</strong> your data with analytics companies, ad networks, or data brokers.</li>
                <li>We <strong className="text-red-400">never track</strong> you across apps or websites outside the Aero Store platform.</li>
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">04</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">🍪</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Cookies & Local Storage</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>We use <strong className="text-on-surface">essential cookies only</strong> — required for authentication and session management. We do not use third-party tracking cookies, advertising pixels, or analytics cookies.</p>
              <p>Local storage may be used to remember your theme preference and language settings. This data never leaves your device.</p>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">05</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">👶</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Children&apos;s Privacy</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>Aero Store is committed to protecting children&apos;s privacy. We do not knowingly collect data from users under 13. If we learn that we have inadvertently collected such data, it will be <strong className="text-red-400">deleted within 48 hours</strong>.</p>
              <p>For users between 13–18, parental consent is required for developer account creation.</p>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">06</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">⚖️</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Your Rights</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>Under the Indian IT Act and GDPR (for applicable users), you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-on-surface">Access</strong> — Request a full copy of all data we hold about you.</li>
                <li><strong className="text-on-surface">Correction</strong> — Update or correct any inaccurate personal information.</li>
                <li><strong className="text-on-surface">Deletion</strong> — Request permanent deletion of your account and all associated data.</li>
                <li><strong className="text-on-surface">Portability</strong> — Export your data in a machine-readable format.</li>
                <li><strong className="text-on-surface">Objection</strong> — Opt out of any non-essential data processing.</li>
              </ul>
            </div>
          </div>

        </div>

        <div className="mt-16 bg-[radial-gradient(ellipse_at_center,var(--primary-container)_0%,transparent_100%)] p-12 text-center rounded-[40px] border border-outline-variant/30">
          <h2 className="font-headline-lg font-bold text-on-surface mb-4">Have Questions?</h2>
          <p className="font-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">Reach out to our privacy team for any data-related queries or requests.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:aerotechnologies.dev@gmail.com" className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold font-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg">
              Contact Privacy Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
