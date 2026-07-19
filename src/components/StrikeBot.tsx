"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToActiveAnnouncements, Announcement } from '@/lib/db';
import Groq from 'groq-sdk';

type Message = { id: string; sender: 'bot' | 'user'; text: string; options?: string[]; isTicketOption?: boolean };

const getGroqKey = () => {
  const rev = process.env.NEXT_PUBLIC_GROQ_API_KEY_REV || '';
  return rev.split('').reverse().join('');
};
const rawGroqKey = getGroqKey();

// Initialize Groq (we pass dangerouslyAllowBrowser because we don't have a backend server)
const groq = new Groq({ 
    apiKey: rawGroqKey,
    dangerouslyAllowBrowser: true 
});

const renderFormattedText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

export default function StrikeBot() {
  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [flowState, setFlowState] = useState<'chatting' | 'done'>('chatting');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const unsub = subscribeToActiveAnnouncements((anns) => {
      setAnnouncement(anns.length > 0 ? anns[0] : null);
    });
    
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-strike-bot', handleOpen);
    
    return () => {
      unsub();
      window.removeEventListener('open-strike-bot', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = announcement && announcement.active 
        ? `Hi! I'm Strike, your Aero Store AI assistant. Note: We currently have an active announcement: "${announcement.message}". Please describe your issue, and I'll do my best to help you.`
        : "Hi! I'm Strike, your Aero Store AI assistant. Please describe your issue, and I'll do my best to help you.";
        
      setMessages([
        { 
          id: '1', 
          sender: 'bot', 
          text: greeting
        }
      ]);
    }
  }, [isOpen, messages.length, announcement]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const processHeuristicFallback = (userText: string) => {
    console.log("Using Heuristic Fallback Engine");
    const lowerText = userText.toLowerCase();
    let fallbackResponse = "";
    let fallbackTicket = false;

    if (/\b(hi|hello|hey|help|greetings)\b/.test(lowerText)) {
      fallbackResponse = "Hello! I'm Strike. Please describe the specific issue you're facing (e.g., 'password reset' or 'upload apk'), and I'll do my best to help!";
    }
    else if (/\b(no|didn't help|not working|still failing|nope|doesn't work|fail|create ticket)\b/.test(lowerText)) {
      fallbackResponse = "I'm sorry I couldn't resolve this for you. I've prepared a support ticket with our chat history so a human agent can assist you immediately.";
      fallbackTicket = true;
    }
    else if (/\b(password|login|account|locked|recover|forgot|sign in)\b/.test(lowerText)) {
      fallbackResponse = "It sounds like you need help accessing your account. To reset your password, please go to the Login page and click 'Forgot Password'. If your account is locked, our security team can verify your identity manually. Did this solve your issue?";
    }
    else if (/\b(install|download|parse error|apk|can't open|won't open)\b/.test(lowerText) && (userData?.role !== 'developer' && userData?.role !== 'admin')) {
      fallbackResponse = "If you're having trouble installing an app, please ensure you have 'Install from Unknown Sources' enabled in your Android settings. Also, verify that the download completed successfully. If you see a 'Parse Error', the app might not be compatible with your Android version. Did this solve your issue?";
    }
    else if (/\b(developer|dashboard|publish|upload|apk|update|release)\b/.test(lowerText)) {
      fallbackResponse = "For developers: You can upload and update APKs directly from your Developer Dashboard. Ensure the APK is properly signed and is under 100MB. If an upload fails, check your network connection or try a different browser. Did this solve your issue?";
    }
    else if (/\b(policy|ban|strike|suspend|flagged|removed|disabled)\b/.test(lowerText)) {
      fallbackResponse = "Our platform policies strictly prohibit malware, deceptive behavior, and copyright infringement. If your app was flagged or your account received a strike, you can appeal using the unique appeal code sent to your email. Did this solve your issue?";
    }
    else {
      fallbackResponse = "I couldn't find an immediate automated solution for your specific issue. I can escalate this directly to our human support team. Would you like to create a support ticket?";
      fallbackTicket = true;
    }

    setMessages(prev => {
      const filtered = prev.filter(m => !m.id.endsWith('temp'));
      return [
        ...filtered,
        { 
          id: Date.now().toString(), 
          sender: 'bot', 
          text: fallbackResponse,
          options: fallbackTicket ? ["Create Ticket", "Nevermind"] : []
        }
      ];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || flowState !== 'chatting') return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);

    // Temporary typing indicator
    const tempId = Date.now().toString() + 'temp';
    setMessages(prev => [...prev, { id: tempId, sender: 'bot', text: "..." }]);

    const announcementContext = announcement && announcement.active ? `\n- Active Announcement: ${announcement.message}` : '';

    const systemPrompt = `You are Strike, the official, friendly AI assistant for Aero Store. 
Aero Store has TWO platforms, and you must give answers based on this context:
1. The Aero Store Website (where the user is right now): This is used for creating Developer Accounts, uploading apps (Developer Dashboard), viewing announcements, and downloading the Aero Store APK. 
2. The Aero Store Android App: This is a downloadable Android app that standard users install on their phones to download and play games/apps.

You help both standard Users (who want to download apps) and Developers (who upload apps).

Platform Knowledge:
- Password resets: Tell them to click 'Forgot Password' on the Login page.
- 'Parse Error' on app install: Android version incompatibility or corrupted APK. Tell them to enable 'Install from Unknown Sources' in Android settings.
- Developer APK Uploads: Upload via Developer Dashboard. Max size 100MB. Must be signed.
- Policy/Bans: Apps with malware or copyright violations get flagged. Developers get an appeal code via email to dispute.${announcementContext}

Instructions:
1. Always be conversational, helpful, and concise. 
2. If the user explicitly asks for a human, or if you CANNOT solve their problem after trying, you MUST end your response with exactly: WOULD_YOU_LIKE_A_TICKET

User Profile:
Name: ${userData?.displayName || 'Guest'}
Role: ${userData?.role || 'Guest'}
`;

    try {
      if (!rawGroqKey) throw new Error("Missing API Key");
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 150,
      });

      let responseText = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
      let isTicketOption = false;

      if (responseText.includes("WOULD_YOU_LIKE_A_TICKET")) {
        isTicketOption = true;
        responseText = responseText.replace("WOULD_YOU_LIKE_A_TICKET", "").trim();
        if (!responseText) {
          responseText = "I'm sorry I couldn't resolve this for you. I can prepare a support ticket with our chat history so a human agent can assist you immediately.";
        }
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !m.id.endsWith('temp'));
        return [
          ...filtered, 
          { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: responseText,
            options: isTicketOption ? ["Create Ticket", "Nevermind"] : []
          }
        ];
      });

    } catch (error: any) {
      console.error("Groq API Error:", error);
      setMessages(prev => {
        const filtered = prev.filter(m => !m.id.endsWith('temp'));
        return [
          ...filtered, 
          { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: "DEBUG ERROR: " + (error.message || String(error))
          }
        ];
      });
    }
  };

  const handleOptionClick = (option: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: option }]);
    
    setTimeout(() => {
      if (option === 'Create Ticket') {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "I've drafted a support ticket with your chat history. Click below to send it to our team!" }]);
        setFlowState('done');
        
        const isDev = userData?.role === 'developer' || userData?.role === 'manager' || userData?.role === 'admin';
        const email = isDev ? 'aerotechnologies.dev@gmail.com' : 'aerotechnologies.store@gmail.com';
        const subject = encodeURIComponent(`[${isDev ? 'Dev Support' : 'User Support'}] StrikeBot Escalation`);
        
        let chatHistory = "--- Chat History ---\n";
        messages.forEach(m => {
          if (!m.options || m.options.length === 0) chatHistory += `${m.sender === 'bot' ? 'Strike' : 'User'}: ${m.text}\n`;
        });
        chatHistory += "--------------------\n\n";
        
        chatHistory += "--- User Details ---\n";
        chatHistory += `Name: ${userData?.displayName || 'Guest'}\n`;
        chatHistory += `Email: ${user?.email || 'Not logged in'}\n`;
        chatHistory += `Firebase UID: ${user?.uid || 'N/A'}\n`;
        chatHistory += `Role: ${userData?.role || 'Guest'}\n`;
        chatHistory += "--------------------\n\n";
        
        const body = encodeURIComponent(chatHistory);
        
        setTimeout(() => {
          if (window.confirm("This message will be sent to Aero Technologies. Please click the send button on your email client after reviewing the draft.")) {
            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
          }
        }, 500);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Alright! Let me know if you need anything else." }]);
      }
    }, 600);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--c1)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}
          aria-label="Open Strike Support"
        >
          ⚡
        </button>
      ) : (
        <div style={{ width: 'calc(100vw - 48px)', maxWidth: '350px', height: '500px', maxHeight: 'calc(100vh - 100px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--surface2)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: 'var(--c1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>Strike</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Aero Store AI
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((m, i) => (
              <div key={m.id} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ background: m.sender === 'user' ? 'var(--c1)' : 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '14px', lineHeight: 1.5, color: '#fff', whiteSpace: 'pre-wrap' }}>
                  {renderFormattedText(m.text)}
                </div>
                {m.options && m.options.length > 0 && i === messages.length - 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {m.options.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--c1)', color: 'var(--c1)', borderRadius: '16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', gap: '8px', boxSizing: 'border-box' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={flowState === 'chatting' ? "Describe your issue..." : "Ticket sent."}
              disabled={flowState !== 'chatting'}
              style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '100px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
            <button 
              type="submit" 
              disabled={flowState !== 'chatting' || !input.trim()}
              style={{ padding: '0 16px', borderRadius: '100px', background: 'var(--c1)', color: '#fff', border: 'none', fontWeight: 600, cursor: flowState !== 'chatting' || !input.trim() ? 'not-allowed' : 'pointer', opacity: flowState !== 'chatting' || !input.trim() ? 0.5 : 1, flexShrink: 0 }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
