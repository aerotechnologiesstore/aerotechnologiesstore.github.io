"use client";
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function Support() {
  const { userData } = useAuth();
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
          <div className="legal-label">Help Center</div>
          <div className="legal-title">Support & <span className="grad-text">Ticketing</span></div>
          <div className="legal-updated">We&apos;re here to help — 24/7</div>
        </div>

        <div className="legal-intro">
          Whether you&apos;re a user with a question or a developer facing a technical issue, our
          integrated support system ensures you get fast, transparent help — right here on the platform.
          No external emails, no third-party tools.
        </div>

        {/* Quick Action Cards */}
        <div className="support-grid">
          <div className="support-card">
            <div className="support-card-icon">🐛</div>
            <div className="support-card-title">Report a Bug</div>
            <div className="support-card-desc">Found something broken? Let us know and our Fix Engine will prioritize the patch.</div>
          </div>
          <div className="support-card">
            <div className="support-card-icon">🚨</div>
            <div className="support-card-title">Report an App</div>
            <div className="support-card-desc">Flag a suspicious or policy-violating app. We review all reports within 24 hours.</div>
          </div>
          <div className="support-card">
            <div className="support-card-icon">💬</div>
            <div className="support-card-title">General Inquiry</div>
            <div className="support-card-desc">Questions about the platform, partnerships, or features? We&apos;d love to hear from you.</div>
          </div>
          <div className="support-card">
            <div className="support-card-icon">🔑</div>
            <div className="support-card-title">Account Recovery</div>
            <div className="support-card-desc">Locked out? Lost access? We&apos;ll verify your identity and restore your account securely.</div>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🎫</div>
            <div className="legal-section-title">How the Ticketing System Works</div>
            <div className="legal-section-num">01</div>
          </div>
          <div className="legal-section-body">
            <p>Our built-in ticketing system is designed for <strong>full transparency</strong>:</p>
            <ul>
              <li><strong>Create a ticket</strong> — Describe your issue and select a category. You&apos;ll receive a unique tracking code instantly.</li>
              <li><strong>AI-assisted triage</strong> — Our AI helper will suggest solutions based on known issues. If it can&apos;t help, your ticket is escalated to a human.</li>
              <li><strong>Real-time updates</strong> — Track your ticket status live. Get notified the moment there&apos;s progress.</li>
              <li><strong>Resolution & feedback</strong> — Once resolved, rate your experience to help us improve.</li>
            </ul>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">⏱️</div>
            <div className="legal-section-title">Response Times</div>
            <div className="legal-section-num">02</div>
          </div>
          <div className="legal-section-body">
            <ul>
              <li><strong>Critical (Security/Malware)</strong> — Within 2 hours</li>
              <li><strong>High (App crashes, account issues)</strong> — Within 12 hours</li>
              <li><strong>Medium (Feature requests, UI bugs)</strong> — Within 24 hours</li>
              <li><strong>Low (General questions)</strong> — Within 48 hours</li>
            </ul>
            <p>These are our <strong>maximum response times</strong>. Most tickets are answered much faster.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🤖</div>
            <div className="legal-section-title">AI Help Assistant</div>
            <div className="legal-section-num">03</div>
          </div>
          <div className="legal-section-body">
            <p>Before creating a ticket, our <strong>AI-powered help assistant</strong> can instantly resolve common issues:</p>
            <ul>
              <li>Password resets and account recovery</li>
              <li>App installation troubleshooting</li>
              <li>Developer dashboard navigation</li>
              <li>Understanding platform policies</li>
              <li>APK upload error diagnostics</li>
            </ul>
            <p>If the AI can&apos;t resolve your issue, it <strong>automatically generates a detailed ticket</strong> with all the context — so the human agent doesn&apos;t ask you to repeat anything.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">⚖️</div>
            <div className="legal-section-title">Dispute Resolution</div>
            <div className="legal-section-num">04</div>
          </div>
          <div className="legal-section-body">
            <p>For disputes between users and developers:</p>
            <ul>
              <li>Both parties receive a <strong>unique dispute code</strong> for tracking.</li>
              <li>Each side has <strong>72 hours to present their case</strong> with supporting evidence.</li>
              <li>Aero Store mediates with a <strong>binding decision within 7 business days</strong>.</li>
              <li>All actions are logged in a <strong>tamper-proof audit trail</strong>.</li>
            </ul>
          </div>
        </div>

        <div className="legal-contact">
          <div className="legal-contact-title">Can't Find What You Need?</div>
          <div className="legal-contact-desc">Reach out directly and we'll get back to you as quickly as possible.</div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            {userData?.role === 'developer' || userData?.role === 'manager' || userData?.role === 'admin' ? (
              <a href="mailto:aerotechnologies.dev@gmail.com?subject=[Dev%20Support]%20General%20Inquiry&body=Developer%20ID:%20%0D%0AIssue%20Description:%20" className="btn-secondary">
                Email Support Team
              </a>
            ) : (
              <a href="mailto:aerotechnologies.store@gmail.com?subject=[User%20Support]%20General%20Inquiry&body=Issue%20Description:%20" className="btn-primary">
                Email Support Team
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
