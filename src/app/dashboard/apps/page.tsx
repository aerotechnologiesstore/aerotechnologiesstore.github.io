"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToDeveloperApps, deleteApp, AppListing, checkIfAppealPending, submitAppAppeal } from '@/lib/db';
import Link from 'next/link';

export default function MyAppsPage() {
  const { user, userData } = useAuth();
  const [apps, setApps] = useState<AppListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAppealsMap, setPendingAppealsMap] = useState<Record<string, boolean>>({});
  
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealingApp, setAppealingApp] = useState<AppListing | null>(null);
  const [appealMessage, setAppealMessage] = useState("");
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToDeveloperApps(user.uid, async (data) => {
      setApps(data);
      
      const appealsMap: Record<string, boolean> = {};
      for (const app of data) {
        if (app.status === 'paused') {
          appealsMap[app.id] = await checkIfAppealPending(app.id);
        }
      }
      setPendingAppealsMap(appealsMap);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this app? This action cannot be undone and will instantly remove it from the store.")) return;
    try {
      await deleteApp(appId);
    } catch (e) {
      console.error(e);
      alert("Failed to delete app.");
    }
  };

  const handleOpenAppeal = (app: AppListing) => {
    setAppealingApp(app);
    setAppealMessage("");
    setAppealModalOpen(true);
  };

  const handleSubmitAppeal = async () => {
    if (!appealingApp || !user || !userData) return;
    if (!appealMessage.trim()) {
      alert("Please provide a message detailing why the app should be reopened.");
      return;
    }
    
    if (!appealingApp.pausedByUid) {
      alert("Error: Cannot find the admin who paused this app. Please contact general support via the Support page.");
      return;
    }
    
    setSubmittingAppeal(true);
    try {
      await submitAppAppeal(
        appealingApp.id,
        appealingApp.appName,
        user.uid,
        appealingApp.pausedByUid,
        appealingApp.pausedByName || 'Admin',
        appealingApp.pausedByAlias || 'Agent',
        appealMessage.trim()
      );
      setPendingAppealsMap(prev => ({ ...prev, [appealingApp.id]: true }));
      setAppealModalOpen(false);
      alert("Appeal submitted successfully! It will be reviewed directly by the agent who paused your app.");
    } catch(e) {
      console.error(e);
      alert("Failed to submit appeal.");
    }
    setSubmittingAppeal(false);
  };

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-2 text-on-surface">My Apps</h1>
      <p className="text-on-surface-variant mb-8">Manage all your published and pending applications.</p>

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">Loading apps...</div>
      ) : apps.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant p-12 flex flex-col items-center text-center rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">No Apps Published Yet</h2>
          <p className="text-on-surface-variant mb-6 max-w-md">
            Once you upload your first app, it will appear here. You can manage updates, check reviews, and track downloads.
          </p>
          <Link href="/dashboard/upload/" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md">
            Upload Your First App
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {apps.map(app => (
            <div key={app.id} className="bg-surface-container border border-outline-variant p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-center">
              <img src={app.iconUrl} alt="Icon" className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
              <div className="flex-1 min-w-[250px] text-center md:text-left">
                <h3 className="text-2xl font-bold text-on-surface mb-1">{app.appName}</h3>
                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start mb-2">
                  <span className="text-sm px-2 py-1 bg-surface-variant text-on-surface rounded-md">v{app.version}</span>
                  <span className={`text-sm px-2 py-1 rounded-md font-bold uppercase ${app.status === 'published' ? 'bg-success-green/20 text-success-green' : app.status === 'rejected' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-2">{app.description}</p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto min-w-[160px]">
                <div className="bg-surface p-3 rounded-xl text-center border border-outline-variant">
                  <div className="text-xs text-on-surface-variant uppercase font-semibold">Downloads</div>
                  <div className="text-xl font-bold text-on-surface">{app.downloads}</div>
                </div>
                
                {app.status === 'paused' && (
                  <button 
                    onClick={() => handleOpenAppeal(app)} 
                    disabled={pendingAppealsMap[app.id]}
                    className={`p-3 rounded-xl font-bold transition-colors shadow-sm ${pendingAppealsMap[app.id] ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'}`}
                  >
                    {pendingAppealsMap[app.id] ? 'Appeal Pending' : 'Appeal / Re-open'}
                  </button>
                )}
                
                <Link href={`/dashboard/update?id=${app.id}`} className="p-3 bg-secondary-container/20 text-secondary border border-secondary-container/30 rounded-xl font-bold text-center hover:bg-secondary-container/40 transition-colors">
                  Update App
                </Link>
                <button onClick={() => handleDelete(app.id)} className="p-3 bg-error-container/20 text-error border border-error-container/30 rounded-xl font-bold cursor-pointer hover:bg-error-container hover:text-on-error-container transition-colors">
                  Delete App
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appeal Modal */}
      {appealModalOpen && appealingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low w-full max-w-lg rounded-3xl border border-outline-variant p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-headline-sm font-bold text-on-surface">Submit Appeal</h3>
               <button onClick={() => setAppealModalOpen(false)} className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center hover:bg-surface-container-highest">
                 <span className="material-symbols-outlined text-sm">close</span>
               </button>
             </div>
             
             <p className="font-body-md text-on-surface-variant mb-4">
               Your app <strong>{appealingApp.appName}</strong> was paused by <strong>Agent {appealingApp.pausedByAlias || 'Aero Staff'}</strong>. 
               This message will be routed directly to them for review.
             </p>
             
             <textarea
               value={appealMessage}
               onChange={e => setAppealMessage(e.target.value)}
               placeholder="Example: I have updated the app and fixed the crash issue..."
               className="w-full h-32 p-4 bg-surface border border-outline-variant rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-on-surface mb-6"
             />
             
             <div className="flex gap-4">
               <button onClick={() => setAppealModalOpen(false)} className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-highest transition-colors">
                 Cancel
               </button>
               <button 
                 onClick={handleSubmitAppeal} 
                 disabled={submittingAppeal || !appealMessage.trim()}
                 className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
               >
                 {submittingAppeal ? 'Submitting...' : 'Submit Appeal'}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
