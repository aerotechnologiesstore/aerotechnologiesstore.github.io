"use client";
import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // In a real application, this would send an email to aerotechnologies.dev@gmail.com
    // For now, we simulate a network delay
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,var(--glow)_0%,transparent_70%)] pointer-events-none opacity-10"></div>
      
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="font-label-lg text-primary uppercase tracking-widest mb-4">Get In Touch</div>
          <h1 className="font-display-lg text-4xl md:text-6xl font-bold text-on-surface mb-6">
            Contact <span className="bg-gradient-to-r from-primary to-primary-container text-transparent bg-clip-text">Us</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Have a question, need technical support, or want to report a policy violation? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="flex flex-col gap-8">
            <div className="bg-surface-container-low border border-outline-variant p-8 rounded-3xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">Email Us</h3>
              </div>
              <p className="text-on-surface-variant mb-4">
                For general inquiries, developer support, or business proposals, reach out via email. We aim to respond within 24-48 hours.
              </p>
              <a href="mailto:aerotechnologies.dev@gmail.com" className="text-primary font-bold hover:underline">
                aerotechnologies.dev@gmail.com
              </a>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-8 rounded-3xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-error/20 text-error rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">gavel</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">Legal & Abuse</h3>
              </div>
              <p className="text-on-surface-variant mb-4">
                To report copyright infringement or malicious apps, please include "DMCA" or "ABUSE" in your subject line for expedited review.
              </p>
              <a href="/dmca" className="text-primary font-bold hover:underline">
                Read our DMCA Policy
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-surface-container-low border border-outline-variant p-8 rounded-3xl shadow-lg">
            <h3 className="text-2xl font-bold text-on-surface mb-6">Send a Message</h3>
            
            {status === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-xl flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-5xl mb-4">check_circle</span>
                <p className="font-bold text-xl mb-2">Message Sent!</p>
                <p className="text-sm opacity-90">Thank you for reaching out. Our team will get back to you shortly.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-green-300 hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Your Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Subject</label>
                  <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                    <option value="" disabled>Select a subject...</option>
                    <option value="general">General Inquiry</option>
                    <option value="developer">Developer Support</option>
                    <option value="abuse">Report Abuse / DMCA</option>
                    <option value="business">Business Proposal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Message</label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" disabled={status === 'submitting'} className="mt-2 w-full py-4 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
