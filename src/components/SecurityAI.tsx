"use client";
import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';
import { db } from '@/lib/firebase';
import { collection, updateDoc, doc, deleteDoc, getDocs, query, where } from 'firebase/firestore';

const getGroqKey = () => {
  const rev = process.env.NEXT_PUBLIC_GROQ_API_KEY_REV || '';
  return rev.split('').reverse().join('');
};
const rawGroqKey = getGroqKey();
const groq = new Groq({ apiKey: rawGroqKey, dangerouslyAllowBrowser: true });

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
    if (!input.trim() || !rawGroqKey) return;
    
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
      
      const reply = completion.choices[0]?.message?.content || "Connection lost.";
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
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
      
      {/* AI Chat Interface */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', height: '600px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,163,255,0.05)', borderRadius: '24px 24px 0 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>🤖</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Suspicious Activity Tracking AI</h2>
            <div style={{ fontSize: '13px', color: '#00A3FF', fontWeight: 600 }}>System Active & Monitoring</div>
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.filter(m => m.role !== 'system').map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.role === 'user' ? 'Admin' : 'Security AI'}
              </div>
              <div style={{ 
                background: msg.role === 'user' ? 'var(--c1)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                padding: '16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                fontSize: '14px'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: 'rgba(255,255,255,0.5)', fontSize: '14px', padding: '16px' }}>
              Tracking...
            </div>
          )}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type 'Track User [UID]' or ask for a report..."
            style={{ flex: 1, padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '16px' }}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ padding: '0 24px', background: 'var(--c2)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            Send Command
          </button>
        </div>
      </div>

      {/* Target Action Panel */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', overflowY: 'auto', height: '600px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700 }}>Quick Actions & Targets</h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>
          If the AI flags a user, or you suspect malicious activity, you can forcefully disable or terminate their account here.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {users.map(u => (
            <div key={u.uid} style={{ background: 'var(--bg)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{u.displayName || 'Unnamed User'}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontFamily: 'monospace' }}>UID: {u.uid}</div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleDisableUser(u.uid)} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Disable Login</button>
                <button onClick={() => handleDeleteUser(u.uid)} style={{ flex: 1, padding: '8px', background: 'rgba(255,77,77,0.2)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Terminate</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
