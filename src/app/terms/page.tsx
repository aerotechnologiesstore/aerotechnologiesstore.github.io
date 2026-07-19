"use client";
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import '../legal.css';

const THEMES = [
  { name:'Inferno', bg:'#080400', bg2:'#100800', surface:'#1a0c00', surface2:'#221000', c1:'#FF2D00', c2:'#FF6B00', c3:'#FFB300', border:'rgba(255,107,0,0.15)', glow:'rgba(255,107,0,0.2)' },
  { name:'Cyber', bg:'#000810', bg2:'#001020', surface:'#001428', surface2:'#001a33', c1:'#00A3FF', c2:'#00D4FF', c3:'#7DF9FF', border:'rgba(0,163,255,0.15)', glow:'rgba(0,163,255,0.2)' },
  { name:'Nebula', bg:'#0a0018', bg2:'#120020', surface:'#1a0830', surface2:'#220e3a', c1:'#8B5CF6', c2:'#A78BFA', c3:'#DDD6FE', border:'rgba(139,92,246,0.15)', glow:'rgba(139,92,246,0.2)' },
  { name:'Launch', bg:'#100400', bg2:'#180800', surface:'#201000', surface2:'#2a1400', c1:'#FF4500', c2:'#FF8C00', c3:'#FFD700', border:'rgba(255,140,0,0.15)', glow:'rgba(255,140,0,0.2)' },
];

function applyTheme(t: typeof THEMES[0]) {
  const r = document.documentElement;
  r.style.setProperty('--bg',t.bg); r.style.setProperty('--bg2',t.bg2);
  r.style.setProperty('--surface',t.surface); r.style.setProperty('--surface2',t.surface2);
  r.style.setProperty('--c1',t.c1); r.style.setProperty('--c2',t.c2); r.style.setProperty('--c3',t.c3);
  r.style.setProperty('--border',t.border); r.style.setProperty('--glow',t.glow);
}

export default function TermsOfUse() {
  const [idx, setIdx] = useState(0);
  const cycle = useCallback(() => {
    setIdx(p => { const n=(p+1)%THEMES.length; applyTheme(THEMES[n]); return n; });
  }, []);
  useEffect(() => { applyTheme(THEMES[0]); const i=setInterval(cycle,8000); return ()=>clearInterval(i); }, [cycle]);

  return (
    <div className="legal-page" onContextMenu={e => e.preventDefault()}>
      <div className="legal-container">
        <Link href="/" style={{ color: 'var(--c2)', display: 'inline-block', marginBottom: '32px' }}>Back to Home</Link>

        <div className="legal-header">
          <div className="legal-label">Legal</div>
          <div className="legal-title">Terms of <span className="grad-text">Use</span></div>
          <div className="legal-updated">Last updated: July 15, 2026</div>
        </div>

        <div className="legal-intro">
          By using any product or service by Aero Store, you agree to the following terms.
          We keep them clear, fair, and human-readable — because legal documents shouldn&apos;t require a law degree.
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">📋</div>
            <div className="legal-section-title">Acceptance of Terms</div>
            <div className="legal-section-num">01</div>
          </div>
          <div className="legal-section-body">
            <p>By creating an account, downloading an app, or visiting the Aero Store platform, you agree to be bound by these Terms of Use and our Privacy Policy.</p>
            <p><strong>Note:</strong> A registered account is required to download any applications from the Aero Store. This allows us to provide a secure environment and track download histories for transparency and safety.</p>
            <p>If you disagree with any part of these terms, you must <strong>discontinue use immediately</strong>. We reserve the right to update these terms, and will notify all registered users via email within 7 days of any material changes.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">👤</div>
            <div className="legal-section-title">User Accounts</div>
            <div className="legal-section-num">02</div>
          </div>
          <div className="legal-section-body">
            <ul>
              <li>You must provide <strong>accurate and truthful</strong> information during registration.</li>
              <li>You are responsible for maintaining the <strong>confidentiality</strong> of your account credentials.</li>
              <li>One person = one account. <strong>Duplicate or fake accounts</strong> will be permanently banned.</li>
              <li>You must be at least <strong>13 years old</strong> to create an account. Developer accounts require age 18+.</li>
            </ul>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🏗️</div>
            <div className="legal-section-title">Developer Obligations</div>
            <div className="legal-section-num">03</div>
          </div>
          <div className="legal-section-body">
            <p>If you register as a developer on the Aero Store platform, you agree to:</p>
            <ul>
              <li>Complete <strong>identity and address verification</strong> before publishing any app.</li>
              <li>Ensure your apps are <strong>free from malware</strong>, spyware, adware, and any malicious code.</li>
              <li>Provide <strong>accurate app descriptions</strong> and screenshots that reflect actual functionality.</li>
              <li>Respond to <strong>user feedback and disputes</strong> within 72 hours through the built-in ticketing system.</li>
              <li>Not upload apps that promote <strong>hate speech, violence, illegal activities, or adult content</strong>.</li>
            </ul>
            <p>Violation of these obligations may result in <strong>app removal, account suspension, or permanent ban</strong>.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">⚠️</div>
            <div className="legal-section-title">Prohibited Activities</div>
            <div className="legal-section-num">04</div>
          </div>
          <div className="legal-section-body">
            <p>The following activities are <strong>strictly prohibited</strong> on the Aero Store platform:</p>
            <ul>
              <li>Reverse engineering, decompiling, or attempting to extract source code from any app or the platform itself.</li>
              <li>Scraping, crawling, or automated data collection from the platform without explicit written permission.</li>
              <li>Impersonating other users, developers, or Aero Store staff.</li>
              <li>Posting fake reviews, manipulating ratings, or engaging in review fraud.</li>
              <li>Attempting to bypass security measures, malware scanners, or verification processes.</li>
            </ul>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">📜</div>
            <div className="legal-section-title">Intellectual Property</div>
            <div className="legal-section-num">05</div>
          </div>
          <div className="legal-section-body">
            <p>All Aero Store branding, logos, UI designs, and proprietary technology are <strong>owned by Aero Technologies</strong> and protected under Indian copyright law.</p>
            <p>Developers retain full ownership of their uploaded apps and content. By publishing on our platform, you grant Aero Store a <strong>non-exclusive license</strong> to distribute and display your app to users.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">⚖️</div>
            <div className="legal-section-title">Dispute Resolution</div>
            <div className="legal-section-num">06</div>
          </div>
          <div className="legal-section-body">
            <p>All disputes between users and developers are handled through our <strong>built-in dispute resolution system</strong>:</p>
            <ul>
              <li>Each dispute generates a <strong>unique tracking code</strong> for full transparency.</li>
              <li>Both parties have <strong>72 hours to respond</strong> to a filed dispute.</li>
              <li>If unresolved, Aero Store will <strong>mediate within 7 business days</strong>.</li>
              <li>All decisions include a <strong>timestamped audit trail</strong> accessible to both parties.</li>
            </ul>
            <p>For legal disputes, jurisdiction falls under the <strong>courts of India</strong>.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🔄</div>
            <div className="legal-section-title">Account Termination</div>
            <div className="legal-section-num">07</div>
          </div>
          <div className="legal-section-body">
            <p>You may delete your account at any time. Upon deletion:</p>
            <ul>
              <li>All personal data will be <strong>permanently erased within 30 days</strong>.</li>
              <li>Published apps will be <strong>delisted</strong> from the store.</li>
              <li>Active disputes will be <strong>resolved before account closure</strong>.</li>
            </ul>
            <p>Aero Store reserves the right to terminate accounts that violate these terms, with <strong>written notice and a 7-day appeal window</strong>.</p>
          </div>
        </div>

        <div className="legal-contact">
          <div className="legal-contact-title">Questions About Our Terms?</div>
          <div className="legal-contact-desc">Our team is happy to clarify any terms or conditions.</div>
          <a href="mailto:aerotechnologies.dev@gmail.com" className="btn-primary">Contact Legal Team</a>
        </div>
      </div>
    </div>
  );
}
