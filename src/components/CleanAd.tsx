"use client";
import React, { useEffect } from 'react';

interface CleanAdProps {
  layout?: 'banner' | 'card';
  slotId?: string; // Replace with your actual Google AdSense slot ID
}

export default function CleanAd({ layout = 'banner', slotId = 'XXXXXXXXXX' }: CleanAdProps) {
  
  useEffect(() => {
    // Only push the ad if it hasn't been pushed yet to avoid double-firing errors
    try {
      if (typeof window !== "undefined") {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  if (layout === 'card') {
    return (
      <div className="ad-card-container">
        <div className="ad-badge">Sponsored</div>
        {/* Actual Google AdSense Tag */}
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '100%' }}
             data-ad-client="ca-pub-7936666541728603"
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    );
  }

  // Banner layout (horizontal)
  return (
    <div className="ad-banner-container">
      <div className="ad-banner-edge" />
      <div className="ad-banner-label">Advertisement</div>
      
      {/* Actual Google AdSense Tag */}
      <div className="ad-banner-slot">
        <ins className="adsbygoogle"
             style={{ display: 'inline-block', width: '100%', minHeight: '90px' }}
             data-ad-client="ca-pub-7936666541728603"
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
}
