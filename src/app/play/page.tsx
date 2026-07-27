"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppListing } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function PlayGameContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const router = useRouter();
  
  const [app, setApp] = useState<AppListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGame() {
      if (!id) {
        router.push('/');
        return;
      }
      try {
        const docRef = doc(db, 'apps', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const appData = { id: docSnap.id, ...docSnap.data() } as AppListing;
          if (appData.isPlayable && appData.playableUrl) {
            setApp(appData);
          } else {
            alert("This app is not an Instant Web Game.");
            router.push(`/app?id=${id}`);
          }
        } else {
          router.push('/');
        }
      } catch (e) {
        console.error("Error loading game", e);
        router.push('/');
      }
      setLoading(false);
    }
    loadGame();
  }, [id, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Minimal Header */}
      <div className="h-14 bg-surface-container-highest flex items-center justify-between px-4 border-b border-outline-variant/30 flex-shrink-0 z-10">
        <button 
          onClick={() => router.push(`/app?id=${app.id}`)}
          className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-bold text-sm hidden sm:inline">Back to Store</span>
        </button>
        
        <div className="flex items-center gap-3">
          <img src={app.iconUrl} alt={app.appName} className="w-6 h-6 rounded-md object-cover" />
          <h1 className="font-bold text-on-surface text-sm">{app.appName}</h1>
        </div>
        
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Game Iframe */}
      <div className="flex-1 w-full relative">
        <iframe 
          src={app.playableUrl}
          className="absolute inset-0 w-full h-full border-none"
          allow="autoplay; fullscreen; gamepad"
          title={app.appName}
        ></iframe>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <PlayGameContent />
    </Suspense>
  );
}
