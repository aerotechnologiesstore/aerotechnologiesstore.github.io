"use client";
import Link from 'next/link';
import React from 'react';

export default function TermsOfUse() {
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
            Terms of <span className="bg-gradient-to-r from-primary to-primary-container text-transparent bg-clip-text">Use</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Last updated: July 15, 2026
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-8 mb-12 text-center text-on-surface-variant font-body-lg leading-relaxed shadow-lg">
          By using any product or service by Aero Store, you agree to the following terms.
          We keep them clear, fair, and human-readable — because legal documents shouldn&apos;t require a law degree.
        </div>

        <div className="flex flex-col gap-12">
          
          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">01</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">📋</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Acceptance of Terms</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>By creating an account, downloading an app, or visiting the Aero Store platform, you agree to be bound by these Terms of Use and our Privacy Policy.</p>
              <p className="border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-xl"><strong className="text-primary">Note:</strong> A registered account is required to download any applications from the Aero Store. This allows us to provide a secure environment and track download histories for transparency and safety.</p>
              <p>If you disagree with any part of these terms, you must <strong className="text-red-400">discontinue use immediately</strong>. We reserve the right to update these terms, and will notify all registered users via email within 7 days of any material changes.</p>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">02</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">👤</div>
              <h2 className="font-headline-lg font-bold text-on-surface">User Accounts</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide <strong className="text-on-surface">accurate and truthful</strong> information during registration.</li>
                <li>You are responsible for maintaining the <strong className="text-on-surface">confidentiality</strong> of your account credentials.</li>
                <li>One person = one account. <strong className="text-red-400">Duplicate or fake accounts</strong> will be permanently banned.</li>
                <li>You must be at least <strong className="text-on-surface">13 years old</strong> to create an account. Developer accounts require age 18+.</li>
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">03</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">🏗️</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Developer Obligations</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>If you register as a developer on the Aero Store platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Complete <strong className="text-on-surface">identity and address verification</strong> before publishing any app.</li>
                <li>Ensure your apps are <strong className="text-primary">free from malware</strong>, spyware, adware, and any malicious code.</li>
                <li>Provide <strong className="text-on-surface">accurate app descriptions</strong> and screenshots that reflect actual functionality.</li>
                <li>Respond to <strong className="text-on-surface">user feedback and disputes</strong> within 72 hours through the built-in ticketing system.</li>
                <li>Not upload apps that promote <strong className="text-red-400">hate speech, violence, illegal activities, or adult content</strong>.</li>
              </ul>
              <p className="mt-4 text-red-400 font-bold">Violation of these obligations may result in app removal, account suspension, or permanent ban.</p>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">04</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">⚠️</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Prohibited Activities</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>The following activities are <strong className="text-red-400">strictly prohibited</strong> on the Aero Store platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reverse engineering, decompiling, or attempting to extract source code from any app or the platform itself.</li>
                <li>Scraping, crawling, or automated data collection from the platform without explicit written permission.</li>
                <li>Impersonating other users, developers, or Aero Store staff.</li>
                <li>Posting fake reviews, manipulating ratings, or engaging in review fraud.</li>
                <li>Attempting to bypass security measures, malware scanners, or verification processes.</li>
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">05</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">📜</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Intellectual Property</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>All Aero Store branding, logos, UI designs, and proprietary technology are <strong className="text-primary">owned by Aero Technologies</strong> and protected under Indian copyright law.</p>
              <p>Developers retain full ownership of their uploaded apps and content. By publishing on our platform, you grant Aero Store a <strong className="text-on-surface">non-exclusive license</strong> to distribute and display your app to users.</p>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">06</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">⚖️</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Dispute Resolution</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>All disputes between users and developers are handled through our <strong className="text-on-surface">built-in dispute resolution system</strong>:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Each dispute generates a <strong className="text-on-surface">unique tracking code</strong> for full transparency.</li>
                <li>Both parties have <strong className="text-on-surface">72 hours to respond</strong> to a filed dispute.</li>
                <li>If unresolved, Aero Store will <strong className="text-primary">mediate within 7 business days</strong>.</li>
                <li>All decisions include a <strong className="text-on-surface">timestamped audit trail</strong> accessible to both parties.</li>
              </ul>
              <p>For legal disputes, jurisdiction falls under the <strong className="text-on-surface">courts of India</strong>.</p>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-6xl font-black text-on-surface/5">07</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl bg-surface-container p-3 rounded-2xl">🔄</div>
              <h2 className="font-headline-lg font-bold text-on-surface">Account Termination</h2>
            </div>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>You may delete your account at any time. Upon deletion:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All personal data will be <strong className="text-on-surface">permanently erased within 30 days</strong>.</li>
                <li>Published apps will be <strong className="text-on-surface">delisted</strong> from the store.</li>
                <li>Active disputes will be <strong className="text-on-surface">resolved before account closure</strong>.</li>
              </ul>
              <p>Aero Store reserves the right to terminate accounts that violate these terms, with <strong className="text-on-surface">written notice and a 7-day appeal window</strong>.</p>
            </div>
          </div>

        </div>

        <div className="mt-16 bg-[radial-gradient(ellipse_at_center,var(--primary-container)_0%,transparent_100%)] p-12 text-center rounded-[40px] border border-outline-variant/30">
          <h2 className="font-headline-lg font-bold text-on-surface mb-4">Questions About Our Terms?</h2>
          <p className="font-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">Our team is happy to clarify any terms or conditions.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:aerotechnologies.dev@gmail.com" className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold font-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg">
              Contact Legal Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
