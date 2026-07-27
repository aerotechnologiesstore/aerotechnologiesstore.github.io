"use client";
import React, { useEffect, useState } from 'react';
import { getPendingApps, updateAppStatus, AppListing, getAllUsers, updateUserRole, publishAnnouncement, getAllAnnouncements, deleteAnnouncement, editAnnouncement, Announcement, getAllPendingVerifications, adminReviewVerification, VerificationForm, getDeletionRequests, acceptDeletionRequest, DeletionRequest, revokeVerification, getAllUserDownloadHistories, DownloadRecord, SupportChat, subscribeToPendingSupportChats, subscribeToResolvedSupportChats, claimSupportChat, resolveSupportChat, sendChatMessage, subscribeToChatMessages, cleanupOldChats, updateChatStatus, escalateSupportChat, AppAppeal, subscribeToAppealsForAdmin, resolveAppAppeal } from '@/lib/db';
import { uploadAnnouncementMedia } from '@/lib/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Groq from 'groq-sdk';
import SecurityAIDashboard from '@/components/SecurityAI';

const groq = new Groq({ 
  apiKey: 'proxy-key', 
  baseURL: process.env.NEXT_PUBLIC_AI_PROXY_URL || 'https://aero-ai-proxy.aerotechnologies-store.workers.dev',
  dangerouslyAllowBrowser: true 
});

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'apps' | 'activeApps' | 'staff' | 'announcements' | 'securityAI' | 'verifications' | 'deletions' | 'downloads' | 'support' | 'appeals' | 'reviews'>('apps');
  const [activeApps, setActiveApps] = useState<any[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  
  const [apps, setApps] = useState<(AppListing & { developerName?: string })[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<VerificationForm[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [downloadRecords, setDownloadRecords] = useState<DownloadRecord[]>([]);
  const [appAppeals, setAppAppeals] = useState<AppAppeal[]>([]);

  // Support State
  const [supportView, setSupportView] = useState<'pending' | 'resolved'>('pending');
  const [pendingChats, setPendingChats] = useState<SupportChat[]>([]);
  const [resolvedChats, setResolvedChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatMessagesEndRef = React.useRef<HTMLDivElement>(null);
  const [isGeneratingChatAI, setIsGeneratingChatAI] = useState(false);
  const [isAiAssisted, setIsAiAssisted] = useState(false);
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
  const [appActionModal, setAppActionModal] = useState<{isOpen: boolean, type: 'pause' | 'reject', app: any} | null>(null);
  const [appActionReason, setAppActionReason] = useState("");
  const [isGeneratingActionAI, setIsGeneratingActionAI] = useState(false);

  // Reviews State
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewDeleteModal, setReviewDeleteModal] = useState<{isOpen: boolean, review: any} | null>(null);
  const [reviewDeleteReason, setReviewDeleteReason] = useState("");
  const [isGeneratingReviewAI, setIsGeneratingReviewAI] = useState(false);

  const fetchAllReviews = async () => {
    setLoadingReviews(true);
    try {
      const { getAllReviews } = await import('@/lib/db');
      const revs = await getAllReviews();
      setAllReviews(revs);
    } catch(e) {
      console.error(e);
    }
    setLoadingReviews(false);
  };

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
    if (activeTab === 'reviews') fetchAllReviews();
    
    if (activeTab === 'support') {
      cleanupOldChats().catch(console.error);
      const unsub1 = subscribeToPendingSupportChats((chats) => setPendingChats(chats));
      const unsub2 = subscribeToResolvedSupportChats((chats) => setResolvedChats(chats));
      return () => { unsub1(); unsub2(); };
    }
    
    if (activeTab === 'appeals' && userData) {
      const unsub = subscribeToAppealsForAdmin(userData.uid, (appeals) => setAppAppeals(appeals));
      return () => unsub();
    }
  }, [activeTab, userData]);

  useEffect(() => {
    if (selectedChat?.id) {
      const unsub = subscribeToChatMessages(selectedChat.id, (msgs) => setChatMessages(msgs));
      return () => unsub();
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleClaimChat = async (chat: SupportChat) => {
    if (!userData) return;
    try {
       let fakeName = "Alex";
       try {
         const prompt = "Generate a single friendly, professional first name for a customer support agent. Just return the name, no quotes or punctuation.";
         const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.8,
         });
         fakeName = completion.choices[0]?.message?.content?.trim() || "Alex";
       } catch (groqErr) {
         console.warn("Groq failed to generate name, using fallback:", groqErr);
       }
       
       await claimSupportChat(chat.id!, userData.uid, fakeName);
       
       // Automated time-based greeting
       const hour = new Date().getHours();
       let greeting = "Good evening";
       if (hour >= 5 && hour < 12) greeting = "Good morning";
       else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
       else if (hour >= 17 && hour < 21) greeting = "Good evening";
       else greeting = "Good night";
       
       const automatedMessage = `${greeting}! You are connected to our agent, ${fakeName}. How can I help you today?`;
       await sendChatMessage(chat.id!, userData.uid, 'agent', fakeName, automatedMessage);

       setSelectedChat({ ...chat, status: 'human_handling', agentId: userData.uid, agentAlias: fakeName });
    } catch (e) {
      console.error(e);
      alert("Failed to claim chat. Check permissions or network.");
    }
  };

  const handleEscalateChat = async () => {
    if (!selectedChat?.id) return;
    
    // Determine next tier
    const currentTier = selectedChat.escalationLevel || 'tier1';
    let nextTier: 'tier1' | 'tier2' | 'admin' = 'tier2';
    if (currentTier === 'tier2') nextTier = 'admin';
    else if (currentTier === 'admin') {
      alert("This chat is already at the highest escalation level.");
      return;
    }

    try {
      await escalateSupportChat(selectedChat.id, nextTier);
      setSelectedChat(null); // Unselect because it belongs to a different tier now
    } catch (e) {
      console.error(e);
      alert("Failed to escalate chat.");
    }
  };

  const handleSupportReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChat?.id || !userData) return;
    
    const text = chatInput.trim();
    setChatInput("");
    const wasAssisted = isAiAssisted;
    setIsAiAssisted(false);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    import('@/lib/db').then(({ updateTypingStatus }) => updateTypingStatus(selectedChat.id, 'agent', false));
    
    try {
      await sendChatMessage(selectedChat.id, userData.uid, 'support', selectedChat.agentAlias || "Agent", text, wasAssisted);
      const { sendNotification } = await import('@/lib/db');
      await sendNotification(selectedChat.customerId, "Support Reply", `Agent ${selectedChat.agentAlias || "Agent"} replied: ${text.substring(0, 50)}...`, "/support");
    } catch (e) {
      alert("Failed to send message");
    }
  };

  const handleResolveChat = async () => {
    if (!selectedChat?.id) return;
    try {
      const { updateChatStatus, sendChatMessage } = await import('@/lib/db');
      await sendChatMessage(selectedChat.id, 'system', 'support', 'System', 'This chat has been marked as resolved by the agent. Please let us know if your problem was solved!');
      await updateChatStatus(selectedChat.id, 'resolved');
      setSelectedChat(null);
    } catch (e) {
      alert("Failed to resolve chat");
    }
  };

  const generateChatReplyAI = async () => {
    if (!selectedChat?.id) return;
    setIsGeneratingChatAI(true);
    try {
      const history = chatMessages.map(m => `${m.senderName} (${m.senderRole}): ${m.text}`).join('\n');
      
      let prompt = `You are an AI customer support assistant named ${selectedChat.agentAlias || "Agent"}. Based on the following chat history, write a helpful, professional, and friendly response to the customer. DO NOT include prefixes like "Agent:" or "Here is the response:". Just output the exact text you want to send.\n\nChat History:\n${history}`;
      
      if (chatInput.trim()) {
        prompt += `\n\nIMPORTANT INSTRUCTION: The human agent has written a rough draft of their intended response. You MUST use this draft as the core message, but refine it to be professional, polite, and fully formed. Draft: "${chatInput.trim()}"`;
      }
      
      const completion = await groq.chat.completions.create({
        messages: [{
          role: 'system',
          content: 'You are a helpful customer support agent for Aero Store. Write brief, direct, and polite responses.'
        }, {
          role: 'user', content: prompt
        }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
      });
      setChatInput(completion.choices[0]?.message?.content?.trim() || "");
      setIsAiAssisted(true);
    } catch (e: any) {
      alert("AI Generation failed: " + e.message);
    }
    setIsGeneratingChatAI(false);
  };
  
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (val: string) => {
    setChatInput(val);
    if (!selectedChat?.id) return;
    
    if (val.trim() === '') {
      setIsAiAssisted(false);
      import('@/lib/db').then(({ updateTypingStatus }) => updateTypingStatus(selectedChat.id, 'agent', false));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }
    
    import('@/lib/db').then(({ updateTypingStatus }) => updateTypingStatus(selectedChat.id, 'agent', true));
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      import('@/lib/db').then(({ updateTypingStatus }) => updateTypingStatus(selectedChat.id, 'agent', false));
    }, 2000);
  };

  const fetchActiveApps = async () => {
    setLoadingActive(true);
    try {
      const db = (await import('@/lib/firebase')).db;
      const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
      const appsRef = collection(db, 'apps');
      const q = query(appsRef, where('status', 'in', ['published', 'paused']));
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

  const handleAppActionSubmit = async () => {
    if (!appActionModal) return;
    if (!appActionReason.trim()) {
      alert("Please provide a reason.");
      return;
    }
    
    const { app, type } = appActionModal;
    const { updateAppStatus, publishAnnouncement, sendNotification } = await import('@/lib/db');
    const db = (await import('@/lib/firebase')).db;
    const { doc, getDoc } = await import('firebase/firestore');
    
    try {
      if (type === 'pause') {
        const prompt = "Generate a single friendly, professional first name for an app review agent. Just return the name, no quotes or punctuation.";
        const completion = await groq.chat.completions.create({
           messages: [{ role: 'user', content: prompt }],
           model: 'llama-3.1-8b-instant',
           temperature: 0.8,
        });
        const fakeName = completion.choices[0]?.message?.content?.trim() || "Agent";
        
        await updateAppStatus(app.id, 'paused', userData?.uid, userData?.displayName || 'Admin', fakeName);
        await sendNotification(app.developerId, `App Paused: ${app.appName}`, `Your app has been paused by Agent ${fakeName}. Reason: ${appActionReason}`, "/dashboard", true);
        
        const devUser = await getDoc(doc(db, 'users', app.developerId));
        const toEmail = devUser.exists() ? devUser.data().email : '';
        const subject = encodeURIComponent(`Action Required - App Paused: ${app.appName}`);
        const body = encodeURIComponent(`Dear ${app.developerName},\n\nYour app "${app.appName}" has been paused on Aero Store due to the following reason:\n\n${appActionReason}\n\nUntil this issue is resolved, users cannot download your app.\n\nRegards,\nAero Technologies`);
        
        window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
        
      } else if (type === 'reject') {
        await updateAppStatus(app.id, 'rejected');
        
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        await publishAnnouncement(
          appActionReason, 
          'warning', 
          'all', 
          null, 
          null, 
          null, 
          expiresAt
        );
        
        await sendNotification(app.developerId, `App Rejected: ${app.appName}`, `Your app has been permanently removed from the Aero Store.`, "/dashboard", true);
        
        const devUser = await getDoc(doc(db, 'users', app.developerId));
        const toEmail = devUser.exists() ? devUser.data().email : '';
        const subject = encodeURIComponent(`URGENT: App Rejected - ${app.appName}`);
        const body = encodeURIComponent(`Dear ${app.developerName},\n\nYour app "${app.appName}" has been rejected and permanently removed from Aero Store.\n\nRegards,\nAero Technologies`);
        window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
      }
      
      setAppActionModal(null);
      setAppActionReason("");
      fetchActiveApps();
      
    } catch (e) {
      console.error(e);
      alert("Action failed.");
    }
  };

  const generateActionReasonAI = async () => {
    if (!appActionReason.trim()) {
      alert("Type a rough reason first!");
      return;
    }
    setIsGeneratingActionAI(true);
    try {
      const prompt = appActionModal?.type === 'pause' 
        ? `You are an admin for Aero Store writing an email to a developer explaining why their app "${appActionModal?.app?.appName}" was paused. Use this rough reason: "${appActionReason}". Make it professional, clear, and explain they need to fix it.`
        : `You are writing a public store announcement explaining why the app "${appActionModal?.app?.appName}" was removed. Rough reason: "${appActionReason}". CRITICAL: Do NOT scold the developer. Be professional, polite, and brief. Max 2 sentences.`;
        
      const completion = await groq.chat.completions.create({
        messages: [{
          role: 'system',
          content: 'You are an AI assistant.'
        }, {
          role: 'user', content: prompt
        }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
      });
      setAppActionReason(completion.choices[0]?.message?.content?.trim() || "");
    } catch (e: any) {
      alert("AI Generation failed: " + e.message);
    }
    setIsGeneratingActionAI(false);
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
        if (userData?.role !== 'admin' && (newRole === 'admin' || newRole === 'manager')) {
          alert("Only Admins can assign Manager or Admin roles.");
          return;
        }
        if (userData?.role !== 'admin' && uRole === 'admin') {
          alert("You cannot change an Admin's role.");
          return;
        }
        try {
          await updateUserRole(uid, newRole as any);
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
        e.returnValue = '';
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
        mediaUrl = await uploadAnnouncementMedia(announcementFile, (event) => {
          setUploadProgress(event.progress * 0.95);
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

  const canManageStaff = userData?.role === 'admin' || userData?.role === 'manager';

  const tabButtons = [
    { id: 'apps', label: '📱 Pending Apps' },
    { id: 'activeApps', label: '✅ Active Apps' },
    ...(canManageStaff ? [
      { id: 'staff', label: '👥 User Management' },
      { id: 'verifications', label: '🛡️ Verifications' },
      { id: 'reviews', label: '⭐ Reviews' },
      { id: 'securityAI', label: '🤖 Security AI' },
      { id: 'deletions', label: '🗑️ Deletions', dangerous: true },
      { id: 'downloads', label: '📥 Downloads' },
      { id: 'support', label: '🎧 Support Queue' },
      { id: 'appeals', label: '📝 App Appeals' }
    ] : []),
    { id: 'announcements', label: '📢 Announcements' }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 text-3xl">🛡️</div>
        <h1 className="font-display-lg text-3xl font-bold text-on-surface">Admin Control Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-outline-variant snap-x">
        {tabButtons.map(btn => (
          <button 
            key={btn.id}
            onClick={() => setActiveTab(btn.id as any)}
            className={`snap-start px-6 py-3 rounded-xl font-label-lg whitespace-nowrap transition-colors ${activeTab === btn.id ? (btn.dangerous ? 'bg-red-500/20 text-red-500 font-bold' : 'bg-primary-container text-on-primary-container font-bold') : 'bg-transparent text-on-surface-variant hover:bg-surface-variant'}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ACTIVE APPS */}
      {activeTab === 'activeApps' && (
        <div className="flex flex-col gap-6">
             <div className="flex justify-end mb-2">
                <button onClick={async () => {
                    if(confirm('Scrub all invalid reviews?')) {
                      try {
                        const { collection, getDocs } = await import('firebase/firestore');
                        const { deleteReview, hasUserDownloadedApp, sendNotification, getAppById } = await import('@/lib/db');
                        const reviewsRef = collection(db, 'reviews');
                        const snap = await getDocs(reviewsRef);
                        let deletedCount = 0;
                        for (const d of snap.docs) {
                          const data = d.data();
                          const downloaded = await hasUserDownloadedApp(data.userId, data.appId);
                          if (!downloaded) {
                            await deleteReview(d.id, data.appId);
                            const appData = await getAppById(data.appId);
                            await sendNotification(data.userId, "Review Removed", `Your review for "${appData?.appName || 'an app'}" was removed because you haven't downloaded it. Only users who have downloaded an app can leave reviews.`, undefined, true);
                            deletedCount++;
                          }
                        }
                        alert(`Scrubbed ${deletedCount} invalid reviews.`);
                      } catch(e) {
                        console.error(e);
                        alert("Failed to scrub reviews.");
                      }
                    }
                  }} className="px-4 py-2 bg-error/10 text-error font-bold rounded-full hover:bg-error/20 flex items-center gap-2">
                    <span className="material-symbols-outlined">delete_sweep</span>
                    Scrub Invalid Reviews
                  </button>
             </div>
          {loadingActive ? (
            <div className="text-center py-16 text-on-surface-variant">Loading active apps...</div>
          ) : activeApps.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">No active apps found.</div>
          ) : (
            activeApps.map(app => (
              <div key={app.id} className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <img src={app.iconUrl} alt="Icon" className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-surface-container" />
                <div className="flex-1">
                  <h3 className="font-headline-md font-bold mb-1">{app.appName}</h3>
                  <div className="font-label-lg text-primary mb-1">{app.developerName}</div>
                  <div className="font-body-sm text-on-surface-variant">
                    📍 {app.developerAddress} {app.developerPrivate && <span className="text-red-400 ml-1">(Private)</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  {app.status === 'paused' ? (
                    <button onClick={async () => {
                      const { updateAppStatus } = await import('@/lib/db');
                      await updateAppStatus(app.id, 'published');
                      fetchActiveApps();
                    }} className="bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl px-6 py-3 font-label-lg font-bold hover:bg-green-500/20 transition-colors">
                      Accept (Unpause)
                    </button>
                  ) : (
                    <button onClick={() => setAppActionModal({isOpen: true, type: 'pause', app})} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl px-6 py-3 font-label-lg font-bold hover:bg-yellow-500/20 transition-colors">
                      Pause App
                    </button>
                  )}
                  <button onClick={() => setAppActionModal({isOpen: true, type: 'reject', app})} className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-6 py-3 font-label-lg font-bold hover:bg-red-500/20 transition-colors">
                    Reject App
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}


      {/* PENDING APPS */}
      {activeTab === 'apps' && (
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant">Loading pending apps...</div>
          ) : apps.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-16 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-headline-md font-bold mb-2 text-on-surface">Inbox Zero!</h2>
              <p className="font-body-md text-on-surface-variant">There are no pending apps waiting for review.</p>
            </div>
          ) : (
            apps.map(app => (
              <div key={app.id} className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <img src={app.iconUrl} alt="Icon" className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-surface-container" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-headline-md font-bold">{app.appName}</h3>
                    {app.status === 'scheduled' ? (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded-md tracking-wider">Scheduled for Auto-Publish</span>
                    ) : app.virusScanStatus === 'suspicious' ? (
                      <span className="px-2 py-1 bg-warning/20 text-warning text-[10px] uppercase font-bold rounded-md tracking-wider">Suspicious</span>
                    ) : null}
                  </div>
                  <div className="font-label-lg text-primary mb-2">{app.developerName}</div>
                  <p className="font-body-sm text-on-surface-variant max-w-2xl">{app.description}</p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-48 shrink-0">
                  <a href={app.apkUrl} target="_blank" rel="noreferrer" className="text-center px-4 py-2 bg-surface-variant text-on-surface-variant rounded-xl font-label-lg border border-outline-variant hover:bg-surface-container-highest transition-colors">Inspect APK</a>
                  <a href={`https://www.virustotal.com/gui/search/?query=${encodeURIComponent(app.apkUrl)}`} target="_blank" rel="noreferrer" className="text-center px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-label-lg hover:bg-primary/20 transition-colors">🛡️ VirusTotal Scan</a>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(app.id, 'published')} className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl px-4 py-2 font-bold hover:bg-green-500/20 transition-colors">Approve</button>
                    <button onClick={() => handleAction(app.id, 'rejected')} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-4 py-2 font-bold hover:bg-red-500/20 transition-colors">Reject</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* STAFF MANAGEMENT */}
      {activeTab === 'staff' && canManageStaff && (
        <div className="bg-surface-container-low border border-outline-variant rounded-3xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant">
                    <th className="p-4 font-label-lg font-bold text-on-surface-variant">User Name / Email</th>
                    <th className="p-4 font-label-lg font-bold text-on-surface-variant">Current Role</th>
                    <th className="p-4 font-label-lg font-bold text-on-surface-variant text-right">Update Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.uid} className="border-t border-outline-variant">
                      <td className="p-4">
                        <div className="font-bold text-on-surface">{u.displayName || 'Unnamed User'}</div>
                        <div className="font-body-sm text-on-surface-variant">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full font-label-lg text-sm capitalize">
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select aria-label="Admin Form Field" 
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as any, u.role)}
                          className="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-xl cursor-pointer focus:outline-none focus:border-primary"
                        >
                          <option value="user">User</option>
                          <option value="developer">Developer</option>
                          <option value="staff">Staff (Lower Agent)</option>
                          {userData?.role === 'admin' && (
                            <>
                              <option value="manager">Manager (Medium Agent)</option>
                              <option value="admin">Admin (Higher Agent)</option>
                            </>
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VERIFICATIONS */}
      {activeTab === 'verifications' && canManageStaff && (
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant">Loading verification requests...</div>
          ) : pendingVerifications.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-16 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-headline-md font-bold mb-2 text-on-surface">Inbox Zero!</h2>
              <p className="font-body-md text-on-surface-variant">There are no pending verification requests.</p>
            </div>
          ) : (
            pendingVerifications.map(form => (
              <div key={form.id} className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 flex flex-col gap-6">
                <div>
                  <h3 className="font-headline-md font-bold mb-1">{form.developerName} <span className="text-primary font-normal">({form.companyName || 'No Studio Name'})</span></h3>
                  <div className="font-body-sm text-on-surface-variant">Form ID: {form.id}</div>
                  <div className="font-body-sm text-on-surface-variant">Status: <strong className={form.status === 'action_required' ? 'text-yellow-500' : form.status === 'verified' ? 'text-green-500' : 'text-on-surface'}>{form.status.toUpperCase()}</strong></div>
                </div>
                
                <div className="bg-surface-container-highest p-5 rounded-2xl border-l-4 border-primary flex flex-col gap-2 font-body-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div><span className="text-on-surface-variant">Govt ID:</span> <strong className="text-on-surface">{form.govtId}</strong></div>
                    {form.govtIdUrl && (
                      <a href={form.govtIdUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-sm bg-primary/10 px-3 py-1 rounded-full w-max">
                        View Uploaded Document ↗
                      </a>
                    )}
                  </div>
                  {form.address && <div><span className="text-on-surface-variant">Address:</span> {form.address}</div>}
                  {form.personalEmail && <div><span className="text-on-surface-variant">Personal Email:</span> {form.personalEmail}</div>}
                  {form.organizationEmail && <div><span className="text-on-surface-variant">Org Email:</span> {form.organizationEmail}</div>}
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  {form.status !== 'verified' ? (
                    <>
                      <button 
                        onClick={() => setModalConfig({ isOpen: true, type: 'verify', formId: form.id!, developerId: form.developerId })}
                        className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl px-4 py-3 font-bold hover:bg-green-500/20 transition-colors text-center"
                      >
                        Approve & Verify ✅
                      </button>
                      <button 
                        onClick={() => setModalConfig({ isOpen: true, type: 'action_required', formId: form.id!, developerId: form.developerId })}
                        className="flex-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl px-4 py-3 font-bold hover:bg-yellow-500/20 transition-colors text-center"
                      >
                        Needs Action ⚠️
                      </button>
                      <button 
                        onClick={() => setModalConfig({ isOpen: true, type: 'reject', formId: form.id!, developerId: form.developerId })}
                        className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-4 py-3 font-bold hover:bg-red-500/20 transition-colors text-center"
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
                      className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-4 py-3 font-bold hover:bg-red-500/20 transition-colors text-center"
                    >
                      Revoke Tick ❌
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DELETIONS TAB */}
      {activeTab === 'deletions' && canManageStaff && (
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant">Loading deletion requests...</div>
          ) : deletionRequests.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-16 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-headline-md font-bold mb-2 text-on-surface">No Deletion Requests!</h2>
              <p className="font-body-md text-on-surface-variant">All developers are happy.</p>
            </div>
          ) : (
            deletionRequests.map(req => (
              <div key={req.id} className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-md font-bold mb-1">{req.developerName}</h3>
                    <div className="font-body-sm text-on-surface-variant">Developer ID: {req.developerId}</div>
                    <div className="font-body-sm text-on-surface-variant mt-1">
                      Requested On: {req.requestedAt ? new Date(req.requestedAt.toMillis ? req.requestedAt.toMillis() : req.requestedAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <span className={`px-4 py-1 rounded-full font-label-lg text-sm font-bold ${req.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="bg-surface-container-highest p-5 rounded-2xl border-l-4 border-red-500">
                  <div className="font-label-lg text-on-surface-variant mb-2 uppercase text-xs tracking-wider">Deletion Reason</div>
                  <p className="font-body-md text-on-surface m-0 leading-relaxed">{req.reason}</p>
                </div>
                
                <div className="bg-surface-variant p-4 rounded-2xl font-body-sm text-on-surface-variant">
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
                    className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-4 py-3 font-bold hover:bg-red-500/20 transition-colors text-center w-full"
                  >
                    Accept Request (30 Days)
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* DOWNLOADS TAB */}
      {activeTab === 'downloads' && canManageStaff && (
        <div className="bg-surface-container-low border border-outline-variant rounded-3xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant">Loading downloads...</div>
          ) : downloadRecords.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <h2 className="font-headline-md font-bold mb-2">No Downloads Yet</h2>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant">
                    <th className="p-4 font-label-lg font-bold text-on-surface-variant">App</th>
                    <th className="p-4 font-label-lg font-bold text-on-surface-variant">User ID</th>
                    <th className="p-4 font-label-lg font-bold text-on-surface-variant">Downloaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {downloadRecords.map(rec => (
                    <tr key={rec.id} className="border-t border-outline-variant">
                      <td className="p-4 flex items-center gap-3">
                        <img src={rec.iconUrl} alt="icon" className="w-8 h-8 rounded-lg bg-surface-container" />
                        <div className="font-bold text-on-surface">{rec.appName}</div>
                      </td>
                      <td className="p-4 font-body-sm text-on-surface-variant">{rec.userId}</td>
                      <td className="p-4 font-body-sm text-on-surface-variant">
                        {rec.downloadedAt ? new Date(rec.downloadedAt.toMillis ? rec.downloadedAt.toMillis() : rec.downloadedAt).toLocaleString() : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REVIEWS MANAGEMENT TAB */}
      {activeTab === 'reviews' && canManageStaff && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-headline-md font-bold text-on-surface">All Reviews</h2>
              <p className="font-body-sm text-on-surface-variant">Manage reviews across all apps. Delete inappropriate reviews with a reason.</p>
            </div>
            <button onClick={fetchAllReviews} className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-label-lg hover:bg-primary/20 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh
            </button>
          </div>

          {loadingReviews ? (
            <div className="text-center py-16 text-on-surface-variant">Loading reviews...</div>
          ) : allReviews.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-16 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="font-headline-md font-bold mb-2 text-on-surface">No Reviews Yet</h2>
              <p className="font-body-md text-on-surface-variant">No reviews have been submitted across any apps.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {allReviews.map(review => (
                <div key={review.id} className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-sm">
                        {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-label-lg font-bold text-on-surface">{review.userName || 'Anonymous'}</div>
                        <div className="text-xs text-on-surface-variant">
                          for <span className="font-bold text-primary">{review.appName || 'Unknown App'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-primary text-sm tracking-widest">
                        {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        {review.createdAt?.toMillis ? new Date(review.createdAt.toMillis()).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                    {review.text && (
                      <p className="text-sm text-on-surface-variant bg-surface-container rounded-xl p-3 leading-relaxed">{review.text}</p>
                    )}
                    <div className="text-[10px] text-on-surface-variant mt-2 font-mono opacity-50">User ID: {review.userId}</div>
                  </div>
                  <button
                    onClick={() => { setReviewDeleteModal({isOpen: true, review}); setReviewDeleteReason(""); }}
                    className="px-4 py-2 bg-error/10 text-error border border-error/20 rounded-xl font-label-lg font-bold hover:bg-error/20 transition-colors flex items-center gap-2 shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Delete Modal */}
      {reviewDeleteModal?.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setReviewDeleteModal(null)}>
          <div className="bg-surface border border-outline-variant rounded-3xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-md font-bold text-on-surface mb-2">Delete Review</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Deleting review by <strong>{reviewDeleteModal.review.userName}</strong> for <strong>{reviewDeleteModal.review.appName}</strong> ({reviewDeleteModal.review.rating}★).
            </p>
            {reviewDeleteModal.review.text && (
              <div className="bg-surface-container-low p-3 rounded-xl text-sm text-on-surface-variant mb-4 border border-outline-variant italic">
                "{reviewDeleteModal.review.text}"
              </div>
            )}

            <label className="block text-sm font-bold text-on-surface mb-2">Reason for Deletion</label>
            <textarea
              value={reviewDeleteReason}
              onChange={(e) => setReviewDeleteReason(e.target.value)}
              placeholder="Explain why this review is being removed..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-xl text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y mb-3"
            />

            <button
              onClick={async () => {
                setIsGeneratingReviewAI(true);
                try {
                  const reviewText = reviewDeleteModal.review.text || '(No text provided)';
                  const appName = reviewDeleteModal.review.appName || 'this app';
                  const adminInput = reviewDeleteReason.trim();
                  
                  const userPrompt = adminInput
                    ? `The admin has written this reason for removing the review: "${adminInput}"\n\nRewrite this into a professional, polite moderation message that the user will see. Keep the admin's intent and meaning intact but make it sound official and clear. Keep it under 2-3 sentences.\n\nContext - This is a ${reviewDeleteModal.review.rating}-star review for "${appName}".\nReview text: "${reviewText}"`
                    : `Generate a professional moderation reason for removing this ${reviewDeleteModal.review.rating}-star review for "${appName}":\n\nReview text: "${reviewText}"\n\nSuggest a professional reason in 2-3 sentences.`;

                  const chatCompletion = await groq.chat.completions.create({
                    messages: [
                      {
                        role: "system",
                        content: "You are a professional app store moderator writing review removal reasons. If the admin provides their own reason, rewrite it in a professional and polite tone while keeping their exact intent. If no admin reason is provided, generate a suitable reason based on the review content. Always keep it under 2-3 sentences. Output ONLY the reason text, nothing else."
                      },
                      {
                        role: "user",
                        content: userPrompt
                      }
                    ],
                    model: 'llama-3.1-8b-instant',
                    temperature: 0.7,
                  });
                  const suggestion = chatCompletion.choices[0]?.message?.content || '';
                  setReviewDeleteReason(suggestion);
                } catch (e) {
                  console.error(e);
                  setReviewDeleteReason("Your review was removed for violating our community guidelines. If you believe this was a mistake, please contact support.");
                }
                setIsGeneratingReviewAI(false);
              }}
              disabled={isGeneratingReviewAI}
              className="w-full mb-4 px-4 py-2 bg-secondary-container/30 text-secondary border border-secondary-container/40 rounded-xl font-label-lg hover:bg-secondary-container/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">{isGeneratingReviewAI ? 'sync' : 'auto_awesome'}</span>
              {isGeneratingReviewAI ? 'Generating...' : '✨ AI Suggest Reason'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setReviewDeleteModal(null)}
                className="flex-1 px-4 py-3 bg-surface-container-low text-on-surface-variant rounded-xl font-label-lg hover:bg-surface-variant transition-colors"
              >Cancel</button>
              <button
                onClick={async () => {
                  if (!reviewDeleteReason.trim()) {
                    alert("Please provide a reason for deletion.");
                    return;
                  }
                  try {
                    const { deleteReview, sendNotification } = await import('@/lib/db');
                    await deleteReview(reviewDeleteModal.review.id, reviewDeleteModal.review.appId);
                    await sendNotification(
                      reviewDeleteModal.review.userId,
                      "Review Removed",
                      `Your review for "${reviewDeleteModal.review.appName}" was removed by a moderator.\n\nReason: ${reviewDeleteReason}`,
                      undefined,
                      true
                    );
                    setAllReviews(prev => prev.filter(r => r.id !== reviewDeleteModal.review.id));
                    setReviewDeleteModal(null);
                    setReviewDeleteReason("");
                    alert("Review deleted and user notified.");
                  } catch(e) {
                    console.error(e);
                    alert("Failed to delete review.");
                  }
                }}
                className="flex-1 px-4 py-3 bg-error text-white rounded-xl font-label-lg font-bold hover:bg-error/80 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete & Notify User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY AI TAB */}
      {activeTab === 'securityAI' && canManageStaff && (
        <SecurityAIDashboard users={users} apps={activeApps} />
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-8">
            <h2 className="font-headline-md font-bold mb-2">Create Post</h2>
            <p className="font-body-sm text-on-surface-variant mb-6">This will appear as a rich media card on the homepage.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
              <div className="flex gap-4">
                {['info', 'success', 'warning'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer font-label-lg text-on-surface">
                    <input aria-label="Admin Form Field" type="radio" name="annType" className="accent-primary w-4 h-4" checked={announcementType === type} onChange={() => setAnnouncementType(type as any)} />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4 sm:pl-4 sm:border-l border-outline-variant">
                {['all', 'user', 'developer'].map(aud => (
                  <label key={aud} className="flex items-center gap-2 cursor-pointer font-label-lg text-on-surface">
                    <input aria-label="Target Audience" type="radio" name="targetAudience" className="accent-primary w-4 h-4" checked={targetAudience === aud} onChange={() => setTargetAudience(aud as any)} />
                    <span className="capitalize">{aud === 'all' ? 'Everyone' : aud === 'user' ? 'Users' : 'Devs'}</span>
                  </label>
                ))}
              </div>
              <button 
                onClick={handleAIGenerate}
                disabled={isGeneratingAI}
                className="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl font-bold hover:bg-primary/20 transition-colors flex items-center justify-center whitespace-nowrap"
              >
                {isGeneratingAI ? '✨ Thinking...' : '✨ AI Writer'}
              </button>
            </div>

            <textarea aria-label="Admin Form Field" 
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              placeholder="Type your announcement here..."
              className="w-full h-32 p-4 bg-surface text-on-surface border border-outline-variant rounded-2xl resize-y mb-4 focus:outline-none focus:border-primary placeholder-on-surface-variant/50"
            />

            <div className="mb-6">
              <label className="block mb-2 font-label-lg text-on-surface-variant">Attach Image or Video (Optional)</label>
              <input aria-label="Admin Form Field" 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => setAnnouncementFile(e.target.files?.[0] || null)}
                disabled={publishing}
                className="w-full p-3 bg-surface border border-dashed border-outline-variant rounded-xl text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary/20"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <label className="block mb-2 font-label-lg text-on-surface-variant">Schedule Start (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={scheduledForStr}
                  onChange={e => setScheduledForStr(e.target.value)}
                  className="w-full p-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 font-label-lg text-on-surface-variant">Auto-Disappear Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={expiresAtStr}
                  onChange={e => setExpiresAtStr(e.target.value)}
                  className="w-full p-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {publishing && uploadProgress > 0 && (
              <div className="mb-6">
                <div className="flex justify-between mb-2 font-label-lg text-primary">
                  <span>Uploading Media...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={handlePublishAnnouncement}
                disabled={publishing}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                  className="w-full py-4 bg-surface-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-headline-md font-bold mb-6 text-on-surface">Post History</h2>
            {loading ? (
              <div className="text-on-surface-variant">Loading history...</div>
            ) : announcements.length === 0 ? (
              <div className="text-on-surface-variant">No announcements made yet.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {announcements.map(ann => (
                  <div key={ann.id} className={`bg-surface-container-low border rounded-2xl p-4 relative ${ann.active ? 'border-primary' : 'border-outline-variant'}`}>
                    {ann.active && <div className="absolute -top-3 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">LIVE</div>}
                    
                    <div className="flex gap-4 items-start">
                      {ann.mediaUrl && ann.mediaType === 'image' && (
                        <img src={ann.mediaUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover bg-surface-container" />
                      )}
                      {ann.mediaUrl && ann.mediaType === 'video' && (
                        <video src={ann.mediaUrl} className="w-20 h-20 rounded-xl object-cover bg-surface-container" />
                      )}
                      
                      <div className="flex-1">
                        <p className="font-body-md text-on-surface mb-3 leading-relaxed">{ann.message}</p>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider">
                              {ann.type} • Target: {ann.targetAudience === 'user' ? 'Users' : ann.targetAudience === 'developer' ? 'Developers' : 'Everyone'}
                            </span>
                            {(ann.scheduledFor || ann.expiresAt) && (
                              <span className="font-body-sm text-xs text-on-surface-variant/70">
                                {ann.scheduledFor ? `Starts: ${new Date(ann.scheduledFor).toLocaleString()} ` : ''}
                                {ann.expiresAt ? `Ends: ${new Date(ann.expiresAt).toLocaleString()}` : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditInit(ann)} className="w-10 h-10 rounded-xl bg-surface border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors" title="Edit Announcement">
                              <span className="material-symbols-outlined text-on-surface-variant text-lg">edit</span>
                            </button>
                            <button onClick={() => handleDeleteAnnouncement(ann.id!)} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors" title="Delete Announcement">
                              <span className="material-symbols-outlined text-red-500 text-lg">delete</span>
                            </button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-slide-in-up">
            <h2 className="font-headline-md font-bold mb-2">
              {modalConfig.type === 'verify' ? 'Approve & Verify' : modalConfig.type === 'reject' ? 'Reject Form' : 'Request Action'}
            </h2>
            <p className="font-body-md text-on-surface-variant mb-6">
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
                className="w-full p-4 bg-surface text-on-surface border border-outline-variant rounded-2xl mb-6 focus:outline-none focus:border-primary resize-y"
              />
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={handleModalSubmit}
                className={`flex-1 py-3 rounded-xl font-bold text-on-primary transition-colors ${modalConfig.type === 'verify' ? 'bg-primary hover:bg-primary/90' : modalConfig.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              >
                Confirm
              </button>
              <button 
                onClick={() => { setModalConfig(null); setModalRemark(""); }}
                className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-highest transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT QUEUE */}
      {activeTab === 'support' && (
        <div className="flex flex-col md:flex-row gap-6 h-[800px]">
          {/* List of pending/resolved chats */}
          <div className="w-full md:w-1/3 bg-surface-container-low border border-outline-variant rounded-3xl p-4 flex flex-col h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h2 className="font-headline-sm font-bold text-on-surface">Support Queue</h2>
               <div className="flex gap-1 bg-surface-variant p-1 rounded-lg">
                 <button 
                   onClick={() => setSupportView('pending')} 
                   className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${supportView === 'pending' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                 >
                   Pending
                 </button>
                 <button 
                   onClick={() => setSupportView('resolved')} 
                   className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${supportView === 'resolved' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                 >
                   History
                 </button>
               </div>
             </div>
             
             {supportView === 'pending' && pendingChats.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant font-body-sm">No pending chats</div>
             )}
             {supportView === 'resolved' && resolvedChats.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant font-body-sm">No resolved chats history</div>
             )}

             <div className="flex flex-col gap-2">
               {(supportView === 'pending' ? pendingChats : resolvedChats)
                 .sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0))
                 .filter(chat => {
                      if (userData?.role === 'admin') return true;
                      if (userData?.role === 'manager') return chat.escalationLevel === 'tier2' || chat.escalationLevel === 'tier1' || !chat.escalationLevel;
                      // Staff can only see tier1
                      return chat.escalationLevel === 'tier1' || !chat.escalationLevel;
                    })
                    .map(chat => {
                      const waitTimeMins = chat.status === 'waiting_for_human' 
                        ? Math.floor((Date.now() - (chat.escalatedAt || chat.createdAt)?.toMillis()) / 60000) 
                        : 0;
                        
                      let waitColor = 'border-surface-variant';
                      let waitBg = 'bg-surface';
                      if (chat.status === 'waiting_for_human') {
                        if (waitTimeMins > 10) { waitColor = 'border-red-500/50'; waitBg = 'bg-red-500/10'; }
                        else if (waitTimeMins > 5) { waitColor = 'border-yellow-500/50'; waitBg = 'bg-yellow-500/10'; }
                        else { waitColor = 'border-green-500/50'; waitBg = 'bg-green-500/10'; }
                      }

                      return (
                        <div 
                          key={chat.id} 
                          onClick={() => setSelectedChat(chat)}
                          className={`p-4 rounded-2xl cursor-pointer transition-colors border ${selectedChat?.id === chat.id ? 'bg-primary-container text-on-primary-container border-primary' : `${waitBg} ${waitColor} hover:border-primary/50`}`}
                        >
                           <div className="flex justify-between items-center mb-2">
                              <span className="font-label-md font-bold uppercase flex gap-2 items-center">
                                {chat.customerRole}
                                <span className="text-[10px] opacity-70 bg-black/10 px-1.5 rounded">{chat.escalationLevel?.toUpperCase() || 'TIER1'}</span>
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${chat.status === 'waiting_for_human' ? 'bg-yellow-500/20 text-yellow-500' : chat.status === 'resolved' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                                 {chat.status === 'waiting_for_human' ? `${waitTimeMins}m waiting` : chat.status === 'resolved' ? 'Resolved' : 'In Progress'}
                              </span>
                           </div>
                           <div className="font-body-sm opacity-80 text-xs">Customer ID: {chat.customerId.substring(0, 8)}...</div>
                           {chat.agentRating && (
                             <div className="mt-2 text-xs flex items-center gap-1 text-aero-orange-vibrant">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                {chat.agentRating}/5
                                {chat.agentReview && <span className="text-on-surface-variant truncate ml-1">"{chat.agentReview}"</span>}
                             </div>
                           )}
                        </div>
                      );
                  })}
                </div>
          </div>
          
          {/* Chat Interface */}
          <div className="flex-1 bg-surface-container-low border border-outline-variant rounded-3xl flex flex-col h-full">
            {selectedChat ? (
               <>
                 <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface rounded-t-3xl">
                    <div>
                      <h3 className="font-headline-md font-bold text-on-surface">Chat with {selectedChat.customerRole}</h3>
                      <p className="font-body-sm text-on-surface-variant">Customer UID: {selectedChat.customerId}</p>
                      {selectedChat.agentAlias && (
                         <p className="font-body-sm text-primary font-bold mt-1">Your Alias: {selectedChat.agentAlias}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {selectedChat.status === 'waiting_for_human' ? (
                        <button onClick={() => handleClaimChat(selectedChat)} className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container shadow-lg">
                          Claim Chat
                        </button>
                      ) : selectedChat.status === 'resolved' ? (
                        <div className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-xl font-bold">Resolved</div>
                      ) : (
                        <>
                          <button onClick={handleEscalateChat} className="px-4 py-2 bg-yellow-500/20 text-yellow-600 rounded-xl font-bold hover:bg-yellow-500/30">
                            Escalate
                          </button>
                          <button onClick={handleResolveChat} className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg">
                            Resolve Chat
                          </button>
                        </>
                      )}
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {chatMessages.map(m => {
                      const isCustomer = m.senderRole === 'customer';
                      return (
                        <div key={m.id} className={`flex flex-col max-w-[70%] ${!isCustomer ? 'self-end' : 'self-start'}`}>
                          <div className={`flex items-baseline gap-2 mb-1 ${!isCustomer ? 'justify-end' : ''}`}>
                             <span className={`text-xs font-bold ${!isCustomer ? 'text-primary' : 'text-on-surface-variant'}`}>
                                {m.senderName} {m.senderRole === 'ai' ? '🤖' : ''}
                             </span>
                             <span className="text-[10px] text-on-surface-variant/50">
                               {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                             </span>
                             {m.aiAssisted && (
                               <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                 <span className="material-symbols-outlined text-[10px]">temp_preferences_custom</span>
                                 AI Assisted
                               </span>
                             )}
                          </div>
                          <div className={`p-4 rounded-2xl font-body-md whitespace-pre-wrap ${!isCustomer ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container-highest text-on-surface rounded-tl-sm'}`}>
                             {m.text}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatMessagesEndRef} />
                 </div>

                 {selectedChat.status === 'resolved' && (
                    <div className="p-4 bg-surface-variant text-center border-t border-outline-variant rounded-b-3xl text-sm font-bold text-on-surface-variant">
                      Chat ended and resolved.
                    </div>
                 )}

                 {selectedChat.status !== 'resolved' && (
                 <div className="p-6 border-t border-outline-variant bg-surface rounded-b-3xl">
                   {selectedChat.customerTyping && (
                     <div className="text-xs text-on-surface-variant italic mb-2 animate-pulse">
                       Customer is typing...
                     </div>
                   )}
                   <div className="flex justify-end mb-2">
                     <button 
                       type="button"
                       onClick={generateChatReplyAI}
                       disabled={selectedChat.status === 'waiting_for_human' || isGeneratingChatAI}
                       className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-xl font-bold hover:bg-primary/20 transition-colors flex items-center justify-center whitespace-nowrap text-xs shadow-sm disabled:opacity-50"
                     >
                       {isGeneratingChatAI ? '✨ Thinking...' : '✨ AI Writer'}
                     </button>
                   </div>
                   <form onSubmit={handleSupportReply} className="flex gap-2">
                     <textarea 
                       value={chatInput}
                       onChange={e => handleInputChange(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           if (chatInput.trim() && selectedChat.status !== 'waiting_for_human') {
                             handleSupportReply(e as any);
                           }
                         }
                       }}
                       disabled={selectedChat.status === 'waiting_for_human'}
                       placeholder={selectedChat.status === 'waiting_for_human' ? "Claim chat to reply..." : "Type your reply... (Shift+Enter for new line)"}
                       className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:outline-none focus:border-primary disabled:opacity-50 resize-y min-h-[50px] max-h-48"
                       rows={1}
                     />
                     <button 
                       type="submit"
                       disabled={selectedChat.status === 'waiting_for_human' || !chatInput.trim()}
                       className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold disabled:opacity-50 hover:bg-primary-container hover:text-on-primary-container shadow-lg"
                     >
                       <span className="material-symbols-outlined">send</span>
                     </button>
                   </form>
                 </div>
                 )}
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8 text-center">
                 <div className="text-6xl mb-4">💬</div>
                 <h3 className="font-headline-md font-bold mb-2">Select a Chat</h3>
                 <p className="font-body-md max-w-md">Choose a pending chat from the queue on the left to start providing support.</p>
               </div>
            )}
          </div>
        </div>
      )}

      {/* APP APPEALS */}
      {activeTab === 'appeals' && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-6">
             <h2 className="font-headline-md font-bold text-on-surface mb-2">My App Appeals</h2>
             <p className="font-body-md text-on-surface-variant mb-6">These are appeals for apps that YOU personally paused. Only you can see and resolve them.</p>
             
             {appAppeals.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant font-body-lg">You have no pending appeals! 🎉</div>
             ) : (
                <div className="grid grid-cols-1 gap-4">
                  {appAppeals.map(appeal => (
                    <div key={appeal.id} className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                       <div>
                         <h3 className="font-headline-sm font-bold text-on-surface mb-1">{appeal.appName}</h3>
                         <div className="font-body-sm text-on-surface-variant mb-2">Developer UID: {appeal.developerId}</div>
                         <div className="font-body-sm text-on-surface-variant mb-4 bg-surface-container p-4 rounded-xl border border-outline-variant">
                           <span className="font-bold text-on-surface block mb-1">Developer Message:</span>
                           "{appeal.message}"
                         </div>
                         <div className="text-xs text-primary font-bold">You are interacting as: {appeal.adminAlias}</div>
                       </div>
                       <button 
                         onClick={async () => {
                           if (confirm("Are you sure you want to resolve this appeal? If you intend to unpause the app, please go to Active Apps and Accept it first.")) {
                             await resolveAppAppeal(appeal.id!);
                           }
                         }}
                         className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 whitespace-nowrap shadow-lg"
                       >
                         Mark Resolved
                       </button>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>
      )}

      {/* App Action Modal (Pause / Reject) */}
      {appActionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low w-full max-w-lg rounded-3xl border border-outline-variant p-6 flex flex-col shadow-2xl animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`font-headline-sm font-bold ${appActionModal.type === 'reject' ? 'text-red-500' : 'text-yellow-500'}`}>
                {appActionModal.type === 'reject' ? 'Reject & Remove App' : 'Pause App Downloads'}
              </h3>
              <button onClick={() => {setAppActionModal(null); setAppActionReason("");}} className="w-10 h-10 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-surface-container-highest">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="font-body-sm text-on-surface-variant mb-4">
              {appActionModal.type === 'pause' 
                ? "Provide a reason for pausing. The AI will format this into an email to the developer. The app will be blocked from downloading but still visible in the store."
                : "Provide a reason for rejection. The AI will format this into a public announcement that will be displayed in the store for 24 hours. The app will be removed."
              }
            </p>
            
            <div className="flex justify-end mb-2">
              <button 
                onClick={generateActionReasonAI}
                disabled={isGeneratingActionAI}
                className="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl font-bold hover:bg-primary/20 transition-colors flex items-center justify-center whitespace-nowrap text-sm"
              >
                {isGeneratingActionAI ? '✨ Thinking...' : '✨ AI Writer'}
              </button>
            </div>
            
            <textarea 
              value={appActionReason}
              onChange={e => setAppActionReason(e.target.value)}
              placeholder="Enter rough reason here..."
              className="w-full h-32 p-4 bg-surface border border-outline-variant rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-on-surface mb-6"
            />
            
            <div className="flex gap-4">
              <button onClick={() => {setAppActionModal(null); setAppActionReason("");}} className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-highest transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleAppActionSubmit}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${appActionModal.type === 'reject' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-yellow-500 text-black hover:bg-yellow-600'}`}
              >
                {appActionModal.type === 'reject' ? 'Submit Rejection' : 'Submit Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low w-full max-w-md rounded-3xl border border-outline-variant p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className={`font-headline-sm font-bold mb-2 ${confirmModal.isDangerous ? 'text-red-500' : 'text-on-surface'}`}>{confirmModal.title}</h3>
            <p className="font-body-md text-on-surface-variant mb-6">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-highest transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }} 
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${confirmModal.isDangerous ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-on-primary hover:bg-primary-container'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
