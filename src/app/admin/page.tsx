"use client";
import React, { useEffect, useState } from 'react';
import { getPendingApps, updateAppStatus, AppListing, getAllUsers, updateUserRole, publishAnnouncement, getAllAnnouncements, deleteAnnouncement, editAnnouncement, Announcement, getAllPendingVerifications, adminReviewVerification, VerificationForm, getDeletionRequests, acceptDeletionRequest, DeletionRequest, revokeVerification, getAllUserDownloadHistories, DownloadRecord } from '@/lib/db';
import { uploadAnnouncementMedia } from '@/lib/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Groq from 'groq-sdk';

const getGroqKey = () => {
  const rev = process.env.NEXT_PUBLIC_GROQ_API_KEY_REV || '';
  return rev.split('').reverse().join('');
};
const rawGroqKey = getGroqKey();
const groq = new Groq({ apiKey: rawGroqKey, dangerouslyAllowBrowser: true });

import SecurityAIDashboard from '@/components/SecurityAI';

export default function AdminPage() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'apps' | 'activeApps' | 'staff' | 'announcements' | 'securityAI' | 'verifications' | 'deletions' | 'downloads'>('apps');
  const [activeApps, setActiveApps] = useState<any[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  
  const [apps, setApps] = useState<(AppListing & { developerName?: string })[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<VerificationForm[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [downloadRecords, setDownloadRecords] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcementType, setAnnouncementType] = useState<'info'|'warning'|'success'>('info');
  const [targetAudience, setTargetAudience] = useState<'user' | 'developer' | 'all'>('all');
  const [announcementFile, setAnnouncementFile] = useState<File | null>(null);
  const [scheduledForStr, setScheduledForStr] = useState("");
  const [expiresAtStr, setExpiresAtStr] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'verify'|'reject'|'action_required', formId: string, developerId: string} | null>(null);
  const [modalRemark, setModalRemark] = useState("");
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, isDangerous?: boolean} | null>(null);

  const handleModalSubmit = async () => {
    if (!modalConfig) return;
    if (modalConfig.type !== 'verify' && !modalRemark) {
      alert("Please enter a remark.");
      return;
    }
    
    try {
      const dbStatus = modalConfig.type === 'verify' ? 'verified' : modalConfig.type === 'reject' ? 'rejected' : 'action_required';
      await adminReviewVerification(modalConfig.formId, modalConfig.developerId, dbStatus, modalRemark);
      if (modalConfig.type === 'action_required') {
        setPendingVerifications(prev => prev.map(f => f.id === modalConfig.formId ? { ...f, status: 'action_required', remark: modalRemark } : f));
      } else {
        setPendingVerifications(prev => prev.filter(f => f.id !== modalConfig.formId));
      }
      setModalConfig(null);
      setModalRemark("");
    } catch(e) {
      alert("Failed to process.");
    }
  };

  const fetchApps = async () => {
    setLoading(true);
    try {
      const pendingApps = await getPendingApps();
      const appsWithDevs = await Promise.all(pendingApps.map(async (app) => {
        try {
          const devSnap = await getDoc(doc(db, 'developers', app.developerId));
          return {
            ...app,
            developerName: devSnap.exists() ? devSnap.data().companyName : 'Unknown Developer'
          };
        } catch {
          return { ...app, developerName: 'Unknown Developer' };
        }
      }));
      setApps(appsWithDevs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const allAnnouncements = await getAllAnnouncements();
      setAnnouncements(allAnnouncements);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const forms = await getAllPendingVerifications();
      setPendingVerifications(forms);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchDeletionRequests = async () => {
    setLoading(true);
    try {
      const reqs = await getDeletionRequests();
      setDeletionRequests(reqs);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const records = await getAllUserDownloadHistories();
      setDownloadRecords(records);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'apps') fetchApps();
    if (activeTab === 'staff') fetchUsers();
    if (activeTab === 'announcements') fetchAnnouncements();
    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'deletions') fetchDeletionRequests();
    if (activeTab === 'downloads') fetchDownloads();
  }, [activeTab]);
  
  const fetchActiveApps = async () => {
    setLoadingActive(true);
    try {
      const db = (await import('@/lib/firebase')).db;
      const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
      const appsRef = collection(db, 'apps');
      const q = query(appsRef, where('status', '==', 'published'));
      const snapshot = await getDocs(q);
      const appsList: any[] = [];
      for (const d of snapshot.docs) {
        const data = d.data();
        let addr = 'Not provided';
        let isPrivate = false;
        try {
          const devDoc = await getDoc(doc(db, 'developers', data.developerId));
          if (devDoc.exists()) {
             addr = devDoc.data().address || addr;
             isPrivate = !!devDoc.data().addressPrivate;
          }
        } catch(e){}
        appsList.push({ id: d.id, ...data, developerAddress: addr, developerPrivate: isPrivate });
      }
      setActiveApps(appsList);
    } catch(e) {
      console.error(e);
    }
    setLoadingActive(false);
  };

  useEffect(() => {
    if (activeTab === 'activeApps') fetchActiveApps();
  }, [activeTab]);

  const handleDeactivateApp = (app: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Deactivate & Flag App',
      message: `Are you sure you want to deactivate ${app.appName} and send an appeal email?`,
      isDangerous: true,
      onConfirm: async () => {
        try {
          const { updateAppStatus } = await import('@/lib/db');
          await updateAppStatus(app.id, 'rejected');
          
          const uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          
          const db = (await import('@/lib/firebase')).db;
          const { doc, getDoc } = await import('firebase/firestore');
          const devUser = await getDoc(doc(db, 'users', app.developerId));
          const toEmail = devUser.exists() ? devUser.data().email : '';
          
          const devDocRef = doc(db, 'developers', app.developerId);
          const devDocSnap = await getDoc(devDocRef);
          if (devDocSnap.exists()) {
            const currentStrikes = devDocSnap.data().strikes || 0;
            const newStrikes = currentStrikes + 1;
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(devDocRef, {
               strikes: newStrikes,
               verificationStatus: newStrikes >= 3 ? 'suspended' : devDocSnap.data().verificationStatus
            });
          }

          const subject = encodeURIComponent(`URGENT: Action Required - App Suspended [${uniqueCode}]`);
          const body = encodeURIComponent(`Dear ${app.developerName},\n\nYour app "${app.appName}" has been deactivated from Aero Store due to the following reason:\n\n[TYPE REASON HERE]\n\nYou have 15 days to resolve this issue and appeal the suspension. To submit an appeal, please reply to this email containing your Unique Appeal Code: ${uniqueCode}.\n\nRegards,\nAero Technologies Security Team`);
          
          window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
          
          fetchActiveApps();
        } catch(e) {
          console.error(e);
          alert("Failed to deactivate.");
        }
      }
    });
  };

  const handleAction = (appId: string, status: 'published' | 'rejected') => {
    setConfirmModal({
      isOpen: true,
      title: status === 'published' ? 'Approve App' : 'Reject App',
      message: `Are you sure you want to ${status === 'published' ? 'APPROVE' : 'REJECT'} this app?`,
      isDangerous: status === 'rejected',
      onConfirm: async () => {
        try {
          await updateAppStatus(appId, status);
          setApps(prev => prev.filter(a => a.id !== appId));
        } catch (e) {
          console.error(e);
          alert("Failed to update status.");
        }
      }
    });
  };

  const handleRoleChange = (uid: string, newRole: 'user' | 'developer' | 'staff' | 'manager' | 'admin') => {
    setConfirmModal({
      isOpen: true,
      title: 'Change User Role',
      message: `Change this user's role to ${newRole.toUpperCase()}?`,
      isDangerous: newRole === 'admin',
      onConfirm: async () => {
        try {
          await updateUserRole(uid, newRole);
          setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (e) {
          console.error(e);
          alert("Failed to change role.");
        }
      }
    });
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (publishing) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [publishing]);

  const handlePublishAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    setPublishing(true);
    setUploadProgress(0);
    try {
      let mediaUrl = null;
      let mediaType = null;
      
      if (announcementFile) {
        mediaType = announcementFile.type.startsWith('video') ? 'video' : 'image';
        
        // Upload to Cloudinary with progress callback
        mediaUrl = await uploadAnnouncementMedia(announcementFile, (p) => {
          setUploadProgress(p * 0.95);
        });
      }

      setUploadProgress(95);
      
      const scheduledFor = scheduledForStr ? new Date(scheduledForStr).getTime() : null;
      const expiresAt = expiresAtStr ? new Date(expiresAtStr).getTime() : null;
      
      if (editingId) {
        const updates: any = {
          message: announcementMsg,
          type: announcementType,
          targetAudience,
          scheduledFor,
          expiresAt
        };
        if (mediaUrl) {
          updates.mediaUrl = mediaUrl;
          updates.mediaType = mediaType;
        }
        await editAnnouncement(editingId, updates);
        alert("Announcement updated successfully!");
      } else {
        await publishAnnouncement(announcementMsg, announcementType, targetAudience, mediaUrl, mediaType as any, scheduledFor, expiresAt);
        alert("Announcement published successfully!");
      }

      setUploadProgress(100);
      
      setAnnouncementMsg("");
      setAnnouncementFile(null);
      setScheduledForStr("");
      setExpiresAtStr("");
      setEditingId(null);
      fetchAnnouncements();
    } catch (e: any) {
      console.error(e);
      alert("Failed to save announcement. " + (e.message || ''));
    }
    setPublishing(false);
    setUploadProgress(0);
  };

  const handleEditInit = (ann: Announcement) => {
    setEditingId(ann.id!);
    setAnnouncementMsg(ann.message);
    setAnnouncementType(ann.type);
    setTargetAudience(ann.targetAudience || 'all');
    setScheduledForStr(ann.scheduledFor ? new Date(ann.scheduledFor - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0,16) : "");
    setExpiresAtStr(ann.expiresAt ? new Date(ann.expiresAt - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0,16) : "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAIGenerate = async () => {
    if (!announcementMsg.trim()) {
      alert("Please type a rough idea of your announcement in the text box first!");
      return;
    }
    const topic = announcementMsg;
    setIsGeneratingAI(true);
    try {
      if (!rawGroqKey) throw new Error("Missing AI configuration");
      const completion = await groq.chat.completions.create({
        messages: [{
          role: 'system',
          content: 'You are an announcement writer for Aero Store. Write a clear, friendly, and beautifully formatted announcement based on the user prompt. Use SIMPLE, EASY-TO-UNDERSTAND language. Avoid complex words and corporate jargon. STRICT CONSTRAINT: Keep it extremely concise (maximum 3 sentences or 4 bullet points, under 350 characters total) so it fits in a small UI card without exceeding the standard size. DO NOT include any introductory or concluding text (like "Here is the announcement:"). Just output the announcement text itself.'
        }, {
          role: 'user', content: topic
        }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
      });
      setAnnouncementMsg(completion.choices[0]?.message?.content || "");
    } catch (e: any) {
      alert("AI Generation failed: " + e.message);
    }
    setIsGeneratingAI(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement?',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deleteAnnouncement(id);
          setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (e) {
          console.error(e);
          alert("Failed to delete.");
        }
      }
    });
  };

  // RBAC checks
  const canManageStaff = userData?.role === 'admin';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ fontSize: '32px', padding: '12px' }}>🛡️</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>Admin Control Panel</h1>
      </div>

      <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('apps')}
          style={{ padding: '12px 24px', background: activeTab === 'apps' ? 'var(--surface2)' : 'transparent', color: activeTab === 'apps' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📱 Pending Apps
        </button>
        <button 
          onClick={() => setActiveTab('activeApps')}
          style={{ padding: '12px 24px', background: activeTab === 'activeApps' ? 'var(--surface2)' : 'transparent', color: activeTab === 'activeApps' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ✅ Active Apps
        </button>
        {canManageStaff && (
          <>
            <button 
              onClick={() => setActiveTab('staff')}
              style={{ padding: '12px 24px', background: activeTab === 'staff' ? 'var(--surface2)' : 'transparent', color: activeTab === 'staff' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              👥 User Management
            </button>
            <button 
              onClick={() => setActiveTab('verifications')}
              style={{ padding: '12px 24px', background: activeTab === 'verifications' ? 'var(--surface2)' : 'transparent', color: activeTab === 'verifications' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🛡️ Verifications
            </button>
            <button 
              onClick={() => setActiveTab('securityAI')}
              style={{ padding: '12px 24px', background: activeTab === 'securityAI' ? 'var(--surface2)' : 'transparent', color: activeTab === 'securityAI' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🤖 Security AI
            </button>
            <button 
              onClick={() => setActiveTab('deletions')}
              style={{ padding: '12px 24px', background: activeTab === 'deletions' ? 'rgba(255,77,77,0.2)' : 'transparent', color: activeTab === 'deletions' ? '#ff4d4d' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🗑️ Deletions
            </button>
            <button 
              onClick={() => setActiveTab('downloads')}
              style={{ padding: '12px 24px', background: activeTab === 'downloads' ? 'var(--surface2)' : 'transparent', color: activeTab === 'downloads' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              📥 Downloads
            </button>
          </>
        )}
        <button 
          onClick={() => setActiveTab('announcements')}
          style={{ padding: '12px 24px', background: activeTab === 'announcements' ? 'var(--surface2)' : 'transparent', color: activeTab === 'announcements' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📢 Announcements
        </button>
      </div>

      
      {/* ACTIVE APPS TAB */}
      {activeTab === 'activeApps' && (
        <>
          {loadingActive ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>Loading active apps...</div>
          ) : activeApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>No active apps found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeApps.map(app => (
                <div key={app.id} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img src={app.iconUrl} alt="Icon" style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover' }} />
                  <div style={{ flex: '1 1 250px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>{app.appName}</h3>
                    <div style={{ fontSize: '14px', color: 'var(--c2)', fontWeight: 600, marginBottom: '4px' }}>{app.developerName}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                      📍 {app.developerAddress} {app.developerPrivate && <span style={{ color: '#ff4d4d', marginLeft: '4px' }}>(Private)</span>}
                    </div>
                  </div>
                  <div className="w-full-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px' }}>
                    <button onClick={() => handleDeactivateApp(app)} style={{ padding: '12px', background: 'rgba(255,77,77,0.2)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Deactivate & Flag</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}


      {/* APPS TAB */}
      {activeTab === 'apps' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>Loading pending apps...</div>
          ) : apps.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Inbox Zero!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>There are no pending apps waiting for review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {apps.map(app => (
                <div key={app.id} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img src={app.iconUrl} alt="Icon" style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover' }} />
                  <div style={{ flex: '1 1 250px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>{app.appName}</h3>
                    <div style={{ fontSize: '14px', color: 'var(--c2)', fontWeight: 600, marginBottom: '8px' }}>{app.developerName}</div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{app.description}</p>
                  </div>
                  <div className="w-full-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px' }}>
                    <a href={app.apkUrl} target="_blank" rel="noreferrer" style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', border: '1px solid var(--border)' }}>Inspect APK</a>
                    <a href={`https://www.virustotal.com/gui/search/?query=${encodeURIComponent(app.apkUrl)}`} target="_blank" rel="noreferrer" style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,163,255,0.1)', color: '#00A3FF', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', border: '1px solid rgba(0,163,255,0.3)' }}>🛡️ VirusTotal Scan</a>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAction(app.id, 'published')} style={{ flex: 1, padding: '12px', background: 'var(--c2)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => handleAction(app.id, 'rejected')} style={{ flex: 1, padding: '12px', background: 'rgba(255,77,77,0.2)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* STAFF TAB */}
      {activeTab === 'staff' && canManageStaff && (
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading users...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>User Name / Email</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Current Role</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Update Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600 }}>{u.displayName || 'Unnamed User'}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '13px', textTransform: 'capitalize' }}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <select aria-label="Admin Form Field" 
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as any)}
                        style={{ padding: '8px 12px', background: 'var(--bg)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <option value="user">User</option>
                        <option value="developer">Developer</option>
                        <option value="staff">Staff (View Only)</option>
                        <option value="manager">Manager (Can Approve)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* VERIFICATIONS TAB */}
      {activeTab === 'verifications' && canManageStaff && (
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading verification requests...</div>
          ) : pendingVerifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Inbox Zero!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>There are no pending verification requests.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
              {pendingVerifications.map(form => (
                <div key={form.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{form.developerName} <span style={{ color: 'var(--c2)' }}>({form.companyName || 'No Studio Name'})</span></h3>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Form ID: {form.id}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Status: <strong style={{ color: form.status === 'action_required' ? '#FFB300' : form.status === 'verified' ? '#00FF00' : '#fff' }}>{form.status.toUpperCase()}</strong></div>
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid var(--c2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Govt ID:</span> <strong>{form.govtId}</strong></div>
                    {form.address && <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Address:</span> {form.address}</div>}
                    {form.personalEmail && <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Personal Email:</span> {form.personalEmail}</div>}
                    {form.organizationEmail && <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Org Email:</span> {form.organizationEmail}</div>}
                  </div>

                  <div className="flex-col-mobile" style={{ display: 'flex', gap: '12px' }}>
                    {form.status !== 'verified' ? (
                      <>
                        <button 
                          onClick={() => setModalConfig({ isOpen: true, type: 'verify', formId: form.id!, developerId: form.developerId })}
                          style={{ flex: 1, padding: '12px', background: '#00A3FF', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Approve & Verify ✅
                        </button>
                        <button 
                          onClick={() => setModalConfig({ isOpen: true, type: 'action_required', formId: form.id!, developerId: form.developerId })}
                          style={{ flex: 1, padding: '12px', background: 'rgba(255,179,0,0.1)', color: '#FFB300', border: '1px solid rgba(255,179,0,0.3)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Needs Action ⚠️
                        </button>
                        <button 
                          onClick={() => setModalConfig({ isOpen: true, type: 'reject', formId: form.id!, developerId: form.developerId })}
                          style={{ flex: 1, padding: '12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reject ❌
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={async () => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Revoke Blue Tick',
                            message: "Are you sure you want to REVOKE this user's blue tick? Their form will be marked rejected and auto-deleted in 24 hours.",
                            isDangerous: true,
                            onConfirm: async () => {
                              try {
                                await revokeVerification(form.id!, form.developerId);
                                fetchVerifications();
                              } catch(e) { alert("Failed to revoke tick."); }
                            }
                          });
                        }}
                        style={{ flex: 1, padding: '12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Revoke Tick ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DELETIONS TAB */}
      {activeTab === 'deletions' && canManageStaff && (
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading deletion requests...</div>
          ) : deletionRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>No Deletion Requests!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>All developers are happy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
              {deletionRequests.map(req => (
                <div key={req.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{req.developerName}</h3>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Developer ID: {req.developerId}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                        Requested On: {req.requestedAt ? new Date(req.requestedAt.toMillis ? req.requestedAt.toMillis() : req.requestedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '100px', 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      background: req.status === 'accepted' ? 'rgba(0,255,0,0.1)' : 'rgba(255,179,0,0.1)',
                      color: req.status === 'accepted' ? '#00FF00' : '#FFB300'
                    }}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid #ff4d4d' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Deletion Reason</div>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>{req.reason}</p>
                  </div>
                  
                  <div style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Auto-Deletion Schedule:</strong> {req.status === 'accepted' ? 'Scheduled for 30 Days' : 'Scheduled for 1 Year (Pending)'}
                  </div>

                  {req.status === 'pending' && (
                    <button 
                      onClick={async () => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'Accept Deletion Request',
                          message: 'Accept this deletion request? The account will be permanently deleted in 30 days.',
                          isDangerous: true,
                          onConfirm: async () => {
                            try {
                              await acceptDeletionRequest(req.id!);
                              fetchDeletionRequests();
                            } catch(e) { alert("Failed to accept request."); }
                          }
                        });
                      }}
                      style={{ padding: '12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Accept Request (30 Days)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOWNLOADS TAB */}
      {activeTab === 'downloads' && canManageStaff && (
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading downloads...</div>
          ) : downloadRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>No Downloads Yet</h2>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>App</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>User ID</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Downloaded At</th>
                </tr>
              </thead>
              <tbody>
                {downloadRecords.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={rec.iconUrl} alt="icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                      <div style={{ fontWeight: 600 }}>{rec.appName}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{rec.userId}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                      {rec.downloadedAt ? new Date(rec.downloadedAt.toMillis ? rec.downloadedAt.toMillis() : rec.downloadedAt).toLocaleString() : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SECURITY AI TAB */}
      {activeTab === 'securityAI' && canManageStaff && (
        <SecurityAIDashboard users={users} apps={activeApps} />
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="admin-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Create Post</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>This will appear as a rich media card on the homepage.</p>
            
            <div className="flex-col-mobile" style={{ display: 'flex', gap: '16px', marginBottom: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '16px' }}>
                {['info', 'success', 'warning'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input aria-label="Admin Form Field" type="radio" name="annType" checked={announcementType === type} onChange={() => setAnnouncementType(type as any)} />
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                  </label>
                ))}
              </div>
              <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                {['all', 'user', 'developer'].map(aud => (
                  <label key={aud} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input aria-label="Target Audience" type="radio" name="targetAudience" checked={targetAudience === aud} onChange={() => setTargetAudience(aud as any)} />
                    <span style={{ textTransform: 'capitalize' }}>{aud === 'all' ? 'Everyone' : aud === 'user' ? 'Normal Users' : 'Developers'}</span>
                  </label>
                ))}
              </div>
              <button 
                onClick={handleAIGenerate}
                disabled={isGeneratingAI}
                style={{ padding: '8px 16px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '8px', fontWeight: 600, cursor: isGeneratingAI ? 'wait' : 'pointer' }}
              >
                {isGeneratingAI ? '✨ Thinking...' : '✨ AI Writer'}
              </button>
            </div>

            <textarea aria-label="Admin Form Field" 
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              placeholder="Type your announcement here..."
              style={{ width: '100%', height: '120px', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '16px', resize: 'vertical', marginBottom: '16px' }}
            />

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Attach Image or Video (Optional)</label>
              <input aria-label="Admin Form Field" 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => setAnnouncementFile(e.target.files?.[0] || null)}
                disabled={publishing}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Schedule Start (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={scheduledForStr}
                  onChange={e => setScheduledForStr(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Auto-Disappear Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={expiresAtStr}
                  onChange={e => setExpiresAtStr(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>

            {publishing && uploadProgress > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--c2)' }}>
                  <span>Uploading Media...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--c1), var(--c2))', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            <div className="flex-col-mobile" style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handlePublishAnnouncement}
                disabled={publishing}
                style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, var(--c1), var(--c2))', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: publishing ? 'wait' : 'pointer' }}
              >
                {publishing ? 'Saving...' : editingId ? 'Update Post' : 'Publish Post'}
              </button>
              {editingId && (
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setAnnouncementMsg("");
                  }}
                  disabled={publishing}
                  style={{ padding: '16px', background: 'var(--surface2)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Post History</h2>
            {loading ? (
              <div>Loading history...</div>
            ) : announcements.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>No announcements made yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ background: 'var(--surface)', border: `1px solid ${ann.active ? 'var(--c2)' : 'var(--border)'}`, borderRadius: '16px', padding: '16px', position: 'relative' }}>
                    {ann.active && <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--c2)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>LIVE</div>}
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {ann.mediaUrl && ann.mediaType === 'image' && (
                        <img src={ann.mediaUrl} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      )}
                      {ann.mediaUrl && ann.mediaType === 'video' && (
                        <video src={ann.mediaUrl} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: 1.5 }}>{ann.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                              {ann.type} • Target: {ann.targetAudience === 'user' ? 'Users' : ann.targetAudience === 'developer' ? 'Developers' : 'Everyone'}
                            </span>
                            {(ann.scheduledFor || ann.expiresAt) && (
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                {ann.scheduledFor ? `Starts: ${new Date(ann.scheduledFor).toLocaleString()} ` : ''}
                                {ann.expiresAt ? `Ends: ${new Date(ann.expiresAt).toLocaleString()}` : ''}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditInit(ann)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer' }} title="Edit Announcement">✏️</button>
                            <button onClick={() => handleDeleteAnnouncement(ann.id!)} style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }} title="Delete Announcement">🗑️</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTION MODAL */}
      {modalConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
              {modalConfig.type === 'verify' ? 'Approve & Verify' : modalConfig.type === 'reject' ? 'Reject Form' : 'Request Action'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
              {modalConfig.type === 'verify' ? "Are you sure you want to verify this developer? They will receive a Blue Tick." : 
               modalConfig.type === 'reject' ? "This will permanently reject the form and the developer cannot edit it." : 
               "Explain why action is required so the developer can edit and fix their application."}
            </p>
            
            {modalConfig.type !== 'verify' && (
              <textarea 
                autoFocus
                placeholder="Type your remark here..."
                value={modalRemark}
                onChange={e => setModalRemark(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', marginBottom: '24px', resize: 'vertical' }}
              />
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleModalSubmit}
                style={{ flex: 1, padding: '12px', background: modalConfig.type === 'verify' ? '#00A3FF' : modalConfig.type === 'reject' ? '#ff4d4d' : '#FFB300', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm
              </button>
              <button 
                onClick={() => { setModalConfig(null); setModalRemark(""); }}
                style={{ flex: 1, padding: '12px', background: 'var(--surface2)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal && confirmModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: confirmModal.isDangerous ? '#ff4d4d' : '#fff' }}>{confirmModal.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
              {confirmModal.message}
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{ flex: 1, padding: '12px', background: confirmModal.isDangerous ? '#ff4d4d' : '#00A3FF', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm
              </button>
              <button 
                onClick={() => setConfirmModal(null)}
                style={{ flex: 1, padding: '12px', background: 'var(--surface2)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
