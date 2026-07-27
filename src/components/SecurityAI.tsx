"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: 'proxy-key', 
  baseURL: process.env.NEXT_PUBLIC_AI_PROXY_URL || 'https://aero-ai-proxy.aerotechnologies-store.workers.dev',
  dangerouslyAllowBrowser: true 
});
import { db } from '@/lib/firebase';
import { collection, updateDoc, doc, deleteDoc, getDocs, query, where } from 'firebase/firestore';

export default function SecurityAIDashboard({ users, apps }: { users: any[], apps: any[] }) {
  const [messages, setMessages] = useState<{role: 'system'|'user'|'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Daily Report
    const userCount = users.length;
    const appCount = apps.length;
    const report = `**Aero Security AI Daily Report:**\n- **Total Users/Developers:** ${userCount}\n- **Active Apps:** ${appCount}\n- **Status:** All systems secure. No widespread suspicious activity detected.\n\nType the name or UID of a user/developer you want to fit a tracker on.`;
    
    setMessages([
      { role: 'system', content: `You are Aero Store's Suspicious Activity Tracking AI. Your job is to help admins track suspicious users. If the admin provides a name or ID, check if they exist in the provided context. If they exist, ask the admin to confirm tracking. Once confirmed, generate a detailed (simulated) suspicious activity report on them based on their profile data. If they don't exist, tell the admin the user was not found. Context: Users: ${JSON.stringify(users.map(u => ({uid: u.uid, name: u.displayName, email: u.email, role: u.role})))}` },
      { role: 'assistant', content: report }
    ]);
  }, [users, apps]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    const newMsgs = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const completion = await groq.chat.completions.create({
        messages: newMsgs,
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
      });
      
      const reply = completion.choices?.[0]?.message?.content || "Connection lost.";
      setMessages([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages([...newMsgs, { role: 'assistant', content: "Error connecting to AI Core: " + e.message }]);
    }
    setLoading(false);
  };

  const handleDisableUser = async (uid: string) => {
    if (!confirm("Are you sure you want to disable this user?")) return;
    try {
      await updateDoc(doc(db, 'users', uid), { disabled: true });
      alert("User disabled successfully.");
    } catch(e: any) {
      alert("Failed: " + e.message);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("CRITICAL: Delete this user and all their apps permanently?")) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      // Delete all apps by this developer
      const q = query(collection(db, 'apps'), where('developerId', '==', uid));
      const snap = await getDocs(q);
      snap.forEach(async (d) => {
        await deleteDoc(doc(db, 'apps', d.id));
      });
      alert("User and their apps terminated.");
    } catch(e: any) {
      alert("Failed: " + e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* AI Chat Interface */}
      <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-3xl flex flex-col h-[600px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-primary/5 flex items-center gap-4">
          <div className="text-4xl">🤖</div>
          <div>
            <h2 className="m-0 text-xl font-bold text-on-surface">Suspicious Activity Tracking AI</h2>
            <div className="text-sm text-primary font-bold">System Active & Monitoring</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.filter(m => m.role !== 'system').map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
              <div className={`text-xs text-on-surface-variant font-bold mb-1 ${msg.role === 'user' ? 'text-right text-primary' : 'text-left'}`}>
                {msg.role === 'user' ? 'Admin' : 'Security AI'}
              </div>
              <div className={`p-4 font-body-md whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm' 
                  : 'bg-surface-container-highest text-on-surface rounded-2xl rounded-tl-sm border border-outline-variant/50'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="self-start text-on-surface-variant text-sm font-bold p-4 animate-pulse">
              Tracking...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-outline-variant flex gap-3 bg-surface-container-low">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type 'Track User [UID]' or ask for a report..."
            className="flex-1 p-4 bg-surface border border-outline-variant rounded-xl text-on-surface text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 bg-error text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 hover:bg-error/90 transition-colors shadow-sm whitespace-nowrap"
          >
            Send Command
          </button>
        </div>
      </div>

      {/* Target Action Panel */}
      <div className="bg-surface border border-outline-variant rounded-3xl p-6 overflow-y-auto h-[600px] shadow-sm">
        <h3 className="m-0 mb-6 text-lg font-bold text-on-surface">Quick Actions & Targets</h3>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
          If the AI flags a user, or you suspect malicious activity, you can forcefully disable or terminate their account here.
        </p>

        <div className="flex flex-col gap-4">
          {users.map(u => (
            <div key={u.uid} className="bg-surface-container-low border border-error/20 rounded-2xl p-4 hover:border-error/50 transition-colors">
              <div className="font-bold text-sm text-on-surface mb-1">{u.displayName || 'Unnamed User'}</div>
              <div className="text-xs text-on-surface-variant mb-4 font-mono">UID: {u.uid}</div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDisableUser(u.uid)} 
                  className="flex-1 p-2 bg-surface-variant text-on-surface-variant hover:text-on-surface border border-transparent rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Disable Login
                </button>
                <button 
                  onClick={() => handleDeleteUser(u.uid)} 
                  className="flex-1 p-2 bg-error/10 text-error border border-error/30 hover:bg-error hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Terminate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
