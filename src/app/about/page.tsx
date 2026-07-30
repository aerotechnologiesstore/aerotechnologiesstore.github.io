"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  const [videoLang, setVideoLang] = useState<'en' | 'hi'>('en');
  const videoRef = useRef<HTMLVideoElement>(null);

  // CSS/JS Magic: Skip NotebookLM outro
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // The NotebookLM outro is usually the last 4 seconds.
      // We force a loop back to 0 just before it plays!
      if (video.duration && video.currentTime > video.duration - 4.5) {
        video.currentTime = 0;
        video.play();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoLang]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,var(--glow)_0%,transparent_70%)] pointer-events-none opacity-10"></div>
      
      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <div className="font-label-lg text-primary uppercase tracking-widest mb-4">Discover</div>
          <h1 className="font-display-lg text-4xl md:text-6xl font-bold text-on-surface mb-6">
            The Future of <span className="bg-gradient-to-r from-primary to-primary-container text-transparent bg-clip-text">App Stores</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            See exactly why developers and users are choosing Aero Store.
          </p>
        </div>

        {/* Video Section */}
        <div className="mb-16 flex flex-col items-center">
          <div className="flex gap-4 mb-6 bg-surface-container rounded-full p-1 border border-outline-variant shadow-sm">
            <button 
              onClick={() => setVideoLang('en')}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${videoLang === 'en' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface hover:bg-surface-container-high'}`}
            >
              English
            </button>
            <button 
              onClick={() => setVideoLang('hi')}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${videoLang === 'hi' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface hover:bg-surface-container-high'}`}
            >
              Hindi
            </button>
          </div>

          {/* Video Container with Watermark Crop Magic */}
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-outline-variant shadow-2xl bg-black relative flex items-center justify-center">
            {/* The scale(1.08) slightly zooms in the video, perfectly pushing the watermark out of the visible bounds! */}
            <video
              key={videoLang}
              ref={videoRef}
              src={videoLang === 'en' ? '/about-media/promo-en.mp4' : '/about-media/promo-hi.mp4'}
              autoPlay
              muted
              playsInline
              controls
              className="w-full h-full object-cover scale-[1.08] origin-center"
            />
          </div>
        </div>

        {/* Infographics Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-display-md font-bold text-center text-on-surface mb-8">Platform Features</h2>
          
          <div className="w-full rounded-3xl overflow-hidden border border-outline-variant shadow-lg bg-surface-container">
            <img 
              src="/about-media/infographic-desktop.png" 
              alt="Aero Store Desktop Features" 
              className="w-full h-auto hidden md:block" 
            />
            <img 
              src="/about-media/infographic-mobile.png" 
              alt="Aero Store Mobile Features" 
              className="w-full h-auto block md:hidden" 
            />
          </div>
        </div>

        <div className="prose prose-invert max-w-none font-body-lg text-on-surface-variant leading-relaxed text-center">
          <h2 className="text-3xl font-bold text-on-surface mb-6">Our Mission</h2>
          <p className="max-w-3xl mx-auto">
            Aero Store was founded with a simple mission: to provide an open, transparent, and highly secure 
            app ecosystem. We give power back to creators with Zero Fees and protect users with Military-Grade AI scanning.
          </p>
        </div>
      </div>
    </div>
  );
}
