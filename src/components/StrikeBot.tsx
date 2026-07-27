"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, ShieldAlert } from 'lucide-react';
import Groq from 'groq-sdk';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToActiveAnnouncements, Announcement } from '@/lib/db';
import { usePathname } from 'next/navigation';

const getGroqKey = () => {
  const rev = process.env.NEXT_PUBLIC_GROQ_API_KEY_REV || '';
  return rev.split('').reverse().join('');
};
const rawGroqKey = getGroqKey();
const groq = new Groq({ apiKey: rawGroqKey, dangerouslyAllowBrowser: true });

type Message = { id: string; sender: 'bot' | 'user'; text: string; options?: string[]; isTicketOption?: boolean };

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
  const pathname = usePathname();
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
1. Always be conversational, helpful, and EXTREMELY concise (maximum 2 sentences). The user expects a fast response.
2. If the user explicitly asks for a human, or if you CANNOT solve their problem after trying, you MUST end your response with exactly: WOULD_YOU_LIKE_A_TICKET

User Profile:
User Profile:
Name: ${userData?.displayName || user?.displayName || 'Guest'}
Role: ${userData?.role || (user ? 'User' : 'Guest')}
`;

    try {
      // Build conversation history from all previous messages
      const conversationHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
      ];
      
      // Add all previous messages as conversation context
      for (const m of messages) {
        if (m.text === '...' || m.id.endsWith('temp')) continue; // Skip typing indicators
        conversationHistory.push({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        });
      }
      
      // Add the current new user message
      conversationHistory.push({ role: 'user', content: userText });

      const completion = await groq.chat.completions.create({
        messages: conversationHistory,
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 100,
      });

      let responseText = completion.choices[0]?.message?.content || "I couldn't generate a response.";
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
    
    setTimeout(async () => {
      if (option === 'Create Ticket') {
        if (!user) {
           setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Please log in first to create a ticket." }]);
           return;
        }
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "I am creating your support chat..." }]);
        setFlowState('done');
        
        try {
          const { createSupportChat, sendChatMessage, updateChatStatus } = await import('@/lib/db');
          const role = (userData?.role === 'developer' || userData?.role === 'manager' || userData?.role === 'admin') ? 'developer' : 'user';
          const chatId = await createSupportChat(user.uid, role);
          
          for (const m of messages) {
            if (!m.options || m.options.length === 0) {
              const senderRole = m.sender === 'bot' ? 'ai' : 'customer';
              const senderName = m.sender === 'bot' ? 'Strike AI' : (userData?.displayName || user.displayName || 'Customer');
              await sendChatMessage(chatId, m.sender === 'bot' ? 'ai_bot' : user.uid, senderRole, senderName, m.text);
            }
          }
          await updateChatStatus(chatId, 'waiting_for_human');
          
          window.location.href = '/support';
        } catch (error) {
          console.error("Escalation failed", error);
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Failed to create support chat. Please try again later." }]);
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Alright! Let me know if you need anything else." }]);
      }
    }, 600);
  };

  if (pathname?.startsWith('/support')) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-primary text-on-primary border-none cursor-pointer shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center text-3xl"
          aria-label="Open Strike Support"
        >
          ⚡
        </button>
      ) : (
        <div className="w-[calc(100vw-48px)] max-w-[350px] h-[500px] max-h-[calc(100vh-100px)] bg-surface-container border border-outline-variant rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-primary/5 p-4 flex justify-between items-center border-b border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl text-on-primary">⚡</div>
              <div>
                <div className="font-bold text-on-surface text-lg">Strike</div>
                <div className="text-xs text-on-surface-variant font-semibold">
                  Aero Store AI
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-transparent border-none text-on-surface-variant hover:text-on-surface text-3xl cursor-pointer p-0 m-0">&times;</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={m.id} className={`max-w-[85%] ${m.sender === 'user' ? 'self-end' : 'self-start'}`}>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.sender === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface border border-outline-variant text-on-surface rounded-bl-sm shadow-sm'}`}>
                  {renderFormattedText(m.text)}
                </div>
                {m.options && m.options.length > 0 && i === messages.length - 1 && (
                  <div className="flex flex-col gap-2 mt-3">
                    {m.options.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        className="py-2 px-4 bg-transparent border border-primary text-primary rounded-full text-sm font-bold cursor-pointer text-center hover:bg-primary/10 transition-colors"
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

          <form onSubmit={handleSubmit} className="p-4 border-t border-outline-variant bg-surface flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={flowState === 'chatting' ? "Describe your issue..." : "Ticket sent."}
              disabled={flowState !== 'chatting'}
              className="flex-1 min-w-0 p-3 rounded-full border border-outline-variant bg-surface-container text-on-surface text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={flowState !== 'chatting' || !input.trim()}
              className="px-5 rounded-full bg-primary text-on-primary border-none font-bold cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
