"use client";
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import '../legal.css';




export default function PrivacyPolicy() {
  
  
  

  return (
    <div className="legal-page" onContextMenu={e => e.preventDefault()}>
      <div className="legal-container">
        <Link href="/" style={{ color: 'var(--c2)', display: 'inline-block', marginBottom: '32px' }}>Back to Home</Link>

        <div className="legal-header">
          <div className="legal-label">Legal</div>
          <div className="legal-title">Privacy <span className="grad-text">Policy</span></div>
          <div className="legal-updated">Last updated: July 15, 2026</div>
        </div>

        <div className="legal-intro">
          At Aero Store, your privacy isn&apos;t a feature — it&apos;s a foundation. This document
          explains how we collect, use, and protect your data across all Aero Store products and services.
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🔐</div>
            <div className="legal-section-title">Data We Collect</div>
            <div className="legal-section-num">01</div>
          </div>
          <div className="legal-section-body">
            <p>We collect only the minimum data required to operate our platform. This includes:</p>
            <ul>
              <li><strong>Account Information</strong> — Name, email address, and phone number during registration.</li>
              <li><strong>Download History</strong> — We securely track apps you download to maintain a personalized history log and for administrative oversight.</li>
              <li><strong>Developer Verification</strong> — Address proof and identity documents (for developer accounts only).</li>
              <li><strong>Usage Analytics</strong> — Anonymous interaction data to improve platform performance. No personal identifiers are attached.</li>
              <li><strong>Device Information</strong> — Basic device type and OS version to ensure app compatibility.</li>
            </ul>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🛡️</div>
            <div className="legal-section-title">How We Protect Your Data</div>
            <div className="legal-section-num">02</div>
          </div>
          <div className="legal-section-body">
            <p>All user data is <strong>encrypted at rest and in transit</strong> using AES-256 and TLS 1.3. We follow industry best practices:</p>
            <ul>
              <li>All data is hosted on <strong>Indian cloud servers</strong> — region-locked and never transferred abroad.</li>
              <li>Developer verification documents are <strong>auto-purged after 90 days</strong> of account verification.</li>
              <li>Inactive user accounts have their data <strong>automatically purged after 12 months</strong> of inactivity.</li>
              <li>We maintain <strong>zero-knowledge architecture</strong> where possible — we can&apos;t read what we don&apos;t store.</li>
            </ul>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🚫</div>
            <div className="legal-section-title">What We Never Do</div>
            <div className="legal-section-num">03</div>
          </div>
          <div className="legal-section-body">
            <p>This is our <strong>iron-clad guarantee</strong> to every user on the platform:</p>
            <ul>
              <li>We <strong>never sell</strong> your personal data to third parties. Ever.</li>
              <li>We <strong>never serve targeted ads</strong> based on your personal information.</li>
              <li>We <strong>never share</strong> your data with analytics companies, ad networks, or data brokers.</li>
              <li>We <strong>never track</strong> you across apps or websites outside the Aero Store platform.</li>
            </ul>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">🍪</div>
            <div className="legal-section-title">Cookies & Local Storage</div>
            <div className="legal-section-num">04</div>
          </div>
          <div className="legal-section-body">
            <p>We use <strong>essential cookies only</strong> — required for authentication and session management. We do not use third-party tracking cookies, advertising pixels, or analytics cookies.</p>
            <p>Local storage may be used to remember your theme preference and language settings. This data never leaves your device.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">👶</div>
            <div className="legal-section-title">Children&apos;s Privacy</div>
            <div className="legal-section-num">05</div>
          </div>
          <div className="legal-section-body">
            <p>Aero Store is committed to protecting children&apos;s privacy. We do not knowingly collect data from users under 13. If we learn that we have inadvertently collected such data, it will be <strong>deleted within 48 hours</strong>.</p>
            <p>For users between 13–18, parental consent is required for developer account creation.</p>
          </div>
        </div>

        <div className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon">⚖️</div>
            <div className="legal-section-title">Your Rights</div>
            <div className="legal-section-num">06</div>
          </div>
          <div className="legal-section-body">
            <p>Under the Indian IT Act and GDPR (for applicable users), you have the right to:</p>
            <ul>
              <li><strong>Access</strong> — Request a full copy of all data we hold about you.</li>
              <li><strong>Correction</strong> — Update or correct any inaccurate personal information.</li>
              <li><strong>Deletion</strong> — Request permanent deletion of your account and all associated data.</li>
              <li><strong>Portability</strong> — Export your data in a machine-readable format.</li>
              <li><strong>Objection</strong> — Opt out of any non-essential data processing.</li>
            </ul>
          </div>
        </div>

        <div className="legal-contact">
          <div className="legal-contact-title">Have Questions?</div>
          <div className="legal-contact-desc">Reach out to our privacy team for any data-related queries or requests.</div>
          <a href="mailto:aerotechnologies.dev@gmail.com" className="btn-primary">Contact Privacy Team</a>
        </div>
      </div>
    </div>
  );
}
