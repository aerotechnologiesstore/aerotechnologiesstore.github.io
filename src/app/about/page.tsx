"use client";
import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,var(--glow)_0%,transparent_70%)] pointer-events-none opacity-10"></div>
      
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="font-label-lg text-primary uppercase tracking-widest mb-4">Our Story</div>
          <h1 className="font-display-lg text-4xl md:text-6xl font-bold text-on-surface mb-6">
            About <span className="bg-gradient-to-r from-primary to-primary-container text-transparent bg-clip-text">Aero Store</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            We are building the most developer-friendly and user-centric application marketplace on the internet.
          </p>
        </div>

        <div className="prose prose-invert max-w-none font-body-lg text-on-surface-variant leading-relaxed">
          <h2 className="text-3xl font-bold text-on-surface mt-12 mb-6">Our Mission</h2>
          <p className="mb-6">
            Aero Store was founded in 2026 with a simple mission: to provide an open, transparent, and highly secure 
            app ecosystem for both developers and users. We believe that software distribution should not be monopolized 
            by a few massive corporations that charge exorbitant fees and enforce opaque review processes.
          </p>
          <p className="mb-6">
            Instead, we give power back to the creators. By providing unlimited storage architecture, military-grade 
            binary scanning via VirusTotal, and AI-driven compliance checks, we ensure that our marketplace is safe 
            without being restrictive.
          </p>

          <h2 className="text-3xl font-bold text-on-surface mt-12 mb-6">For Developers</h2>
          <p className="mb-6">
            We understand the pain points of indie developers because we are developers ourselves. At Aero Store, you 
            don't have to worry about 100MB APK limits, hidden fees, or arbitrary rejections. Our advanced dashboard 
            gives you complete control over your app listings, real-time analytics, and secure media storage.
          </p>

          <h2 className="text-3xl font-bold text-on-surface mt-12 mb-6">For Users</h2>
          <p className="mb-6">
            Your safety is our absolute highest priority. Every single application uploaded to Aero Store goes through 
            a rigorous, multi-layered security pipeline. 
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>AI Metadata Analysis:</strong> Our integrated Gemini AI scans all app descriptions for scams or policy violations.</li>
            <li><strong>VirusTotal Integration:</strong> Every APK is routed through VirusTotal's massive array of anti-malware engines to guarantee binary safety.</li>
            <li><strong>Verified Publishers:</strong> We enforce strict government ID verification for developers before they can publish globally.</li>
          </ul>

          <h2 className="text-3xl font-bold text-on-surface mt-12 mb-6">Join the Revolution</h2>
          <p className="mb-6">
            Whether you are a solo developer looking to launch your first game, or a user looking for independent software 
            outside the walled gardens, you belong here. 
          </p>
        </div>
      </div>
    </div>
  );
}
