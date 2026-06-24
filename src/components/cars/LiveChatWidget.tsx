'use client';

/**
 * Saatvik Cars — Live Chat Widget (Task C16)
 * ---------------------------------------------------------------
 * Self-contained floating chat widget:
 *  - Floating action button (cyan #00D4FF) with pulse + unread badge
 *  - Slide-up chat panel (dark #111827, header gradient)
 *  - Initial bot greeting + 4 quick-reply chips
 *  - Client-side keyword-matching FAQ bot (no AI / no API call)
 *  - 3-dot typing indicator (~800ms) before bot response
 *  - Action buttons: scroll-to-section (#cars / #finance / #services) + WhatsApp
 *  - Session + messages persisted in localStorage (capped at 50)
 *  - Accessible: aria-label, role="dialog", role="log", aria-live="polite"
 *
 * NOTE: The bot is fully client-side. The /api/chat endpoint exists for future
 * server-side persistence but is NOT called by this widget.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BUSINESS } from '@/lib/business';
import { toast } from 'sonner';

// ===== Types =====
type ChatRole = 'bot' | 'user';

type ChatAction = {
  label: string;
  type: 'scroll' | 'whatsapp';
  target?: string; // CSS selector for scroll action, e.g. '#cars'
};

type ChatMessage = {
  role: ChatRole;
  text: string;
  ts: number;
  action?: ChatAction;
};

// ===== Constants =====
const STORAGE_KEY = 'saatvik_chat_session';
const MAX_MESSAGES = 50;
const TYPING_DELAY_MS = 800;

const WHATSAPP_DIGITS = BUSINESS.phones[0].digits;
const WHATSAPP_MSG = 'Hi Saatvik Cars, I have a question.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

const INITIAL_GREETING: ChatMessage = {
  role: 'bot',
  text: 'Hi! 👋 Welcome to Saatvik Cars. How can I help you today?',
  ts: 0,
};

const QUICK_REPLIES: { label: string; send: string }[] = [
  { label: '🚗 Browse cars', send: 'Browse cars' },
  { label: '💰 Finance options', send: 'Finance options' },
  { label: '🔧 Sell my car', send: 'Sell my car' },
  { label: '📞 Talk to a human', send: 'Talk to a human' },
];

// ===== Bot logic (client-side keyword matching) =====
function getBotResponse(input: string): ChatMessage {
  const text = input.toLowerCase().trim();
  const ts = Date.now();
  const has = (...keys: string[]) => keys.some((k) => text.includes(k));

  if (has('browse', 'cars', 'inventory', 'view', 'see')) {
    return {
      role: 'bot',
      text: "You can browse our verified inventory in the Cars section above. Use the filters to narrow by brand, budget, fuel type, and more! Want me to scroll there for you?",
      ts,
      action: { label: 'Yes, show me', type: 'scroll', target: '#cars' },
    };
  }

  if (has('finance', 'emi', 'loan', 'interest')) {
    return {
      role: 'bot',
      text: "We offer easy finance with 8+ partner banks starting at 9.20% p.a. Check our Finance section for an EMI calculator and eligibility check!",
      ts,
      action: { label: 'Show finance', type: 'scroll', target: '#finance' },
    };
  }

  if (has('sell', 'trade', 'exchange', 'valuation')) {
    return {
      role: 'bot',
      text: "Want to sell or trade your car? Get an instant valuation in under 2 minutes! Click 'Sell / Trade Your Car' anywhere on the page.",
      ts,
    };
  }

  if (has('test drive', 'drive', 'book', 'try')) {
    return {
      role: 'bot',
      text: "You can book a test drive from any car's detail page. Just click 'View Details' then 'Book Test Drive'.",
      ts,
    };
  }

  if (has('insurance', 'rc', 'service', 'warranty', 'rsa')) {
    return {
      role: 'bot',
      text: "We offer Insurance, RC Transfer, and Exchange services. Scroll to our Services section for details!",
      ts,
      action: { label: 'Show services', type: 'scroll', target: '#services' },
    };
  }

  if (has('price', 'cost', 'budget', 'rate', 'cheap')) {
    return {
      role: 'bot',
      text: "Our cars start from ₹2 Lakh. Use the budget filters in the Cars section to find cars in your range!",
      ts,
    };
  }

  if (has('contact', 'phone', 'call', 'human', 'talk', 'reach')) {
    const phoneList = BUSINESS.phones.map((p) => p.display).join(', ');
    return {
      role: 'bot',
      text: `You can reach us at ${phoneList} or email ${BUSINESS.email}. Want me to open WhatsApp?`,
      ts,
      action: { label: 'Chat on WhatsApp', type: 'whatsapp' },
    };
  }

  if (has('hours', 'timing', 'open', 'close', 'when')) {
    return {
      role: 'bot',
      text: `We're open ${BUSINESS.hours}.`,
      ts,
    };
  }

  if (has('location', 'address', 'where', 'map', 'locate')) {
    return {
      role: 'bot',
      text: `We're located in ${BUSINESS.address}. See the map in our About section.`,
      ts,
    };
  }

  // Default / unknown
  return {
    role: 'bot',
    text: `I'm not sure about that, but our team can help! Call us at ${BUSINESS.phones[0].display} or type 'talk to human'.`,
    ts,
  };
}

// ===== Custom scrollbar styles (scoped to chat panel) =====
const SCROLLBAR_CSS = `
.saatvik-chat-scroll::-webkit-scrollbar { width: 6px; }
.saatvik-chat-scroll::-webkit-scrollbar-track { background: transparent; }
.saatvik-chat-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.10);
  border-radius: 999px;
}
.saatvik-chat-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.40);
}
.saatvik-chat-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.10) transparent;
}
`;

// ===== Mount detection (no setState-in-effect) =====
// useSyncExternalStore returns false on the server (and during initial hydration),
// then true once the client takes over — without any setState-in-effect.
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// ===== Helpers: read existing session from localStorage =====
function readStoredSession(): {
  sessionId: string;
  messages: ChatMessage[];
  hasUnread: boolean;
} {
  // On the server, return defaults — typeof window guard prevents access.
  if (typeof window === 'undefined') {
    return { sessionId: '', messages: [INITIAL_GREETING], hasUnread: true };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        sessionId?: string;
        messages?: ChatMessage[];
      };
      const hasHistory =
        Array.isArray(parsed.messages) && parsed.messages.length > 0;
      const storedMessages = hasHistory
        ? (parsed.messages as ChatMessage[])
        : [INITIAL_GREETING];
      return {
        // Reuse stored sessionId, otherwise generate a new one for first visit.
        sessionId:
          parsed.sessionId && typeof parsed.sessionId === 'string'
            ? parsed.sessionId
            : generateSessionId(),
        messages: storedMessages,
        hasUnread: !hasHistory,
      };
    }
  } catch {
    // ignore parse / quota errors
  }
  // No stored session — generate a fresh ID for this visitor.
  return {
    sessionId: generateSessionId(),
    messages: [INITIAL_GREETING],
    hasUnread: true,
  };
}

function generateSessionId(): string {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ===== Main component =====
export default function LiveChatWidget() {
  // Client-only flag — false during SSR + initial hydration, true after.
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  // Lazy initial state — read from localStorage once on the client.
  const [stored] = useState(readStoredSession);
  const [sessionId] = useState<string>(stored.sessionId);
  const [messages, setMessages] = useState<ChatMessage[]>(stored.messages);
  const [hasUnread, setHasUnread] = useState<boolean>(stored.hasUnread);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===== Persist session to localStorage (capped at 50) =====
  // Pure side effect — no setState. Runs whenever messages / sessionId change.
  useEffect(() => {
    if (!isMounted || !sessionId) return;
    try {
      const trimmed = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessionId, messages: trimmed })
      );
    } catch {
      // ignore quota errors
    }
  }, [messages, sessionId, isMounted]);

  // ===== Auto-scroll to bottom on new message / typing change =====
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  // ===== Cleanup typing timer on unmount =====
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // ===== Toggle chat panel =====
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setHasUnread(false); // dismiss badge on first open
      return next;
    });
  }, []);

  // ===== Send a user message + queue bot reply =====
  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        role: 'user',
        text: trimmed,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        const botMsg = getBotResponse(trimmed);
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, TYPING_DELAY_MS);
    },
    [isTyping]
  );

  // ===== Enter key sends message =====
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ===== Action button (scroll-to / whatsapp) =====
  const handleAction = useCallback((action: ChatAction) => {
    if (action.type === 'whatsapp') {
      window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
      toast.success('Opening WhatsApp…', {
        description: `Connected to ${BUSINESS.phones[0].display}`,
      });
    } else if (action.type === 'scroll' && action.target) {
      const el = document.querySelector(action.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast.success('Scrolling to section…', { description: action.target });
      } else {
        toast.error('Section not found on this page.');
      }
    }
  }, []);

  // ===== Header WhatsApp button =====
  const openWhatsApp = useCallback(() => {
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp…', {
      description: `Connected to ${BUSINESS.phones[0].display}`,
    });
  }, []);

  // ===== SSR guard — avoid hydration mismatch =====
  // isMounted is false during SSR + initial hydration, true once hydrated.
  if (!isMounted) return null;

  const showQuickReplies = !messages.some((m) => m.role === 'user');

  return (
    <div className="fixed bottom-4 right-4 z-50" suppressHydrationWarning>
      {/* Scoped scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_CSS }} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label="Live chat"
            className="mb-2 flex w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827] text-white shadow-2xl shadow-black/40"
            style={{ height: 'min(480px, 70vh)' }}
            suppressHydrationWarning
          >
            {/* ===== Header ===== */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A] px-4 py-3">
              <img
                src="/saatvik-cars-logo.png"
                alt="Saatvik Cars logo"
                className="h-9 w-9 shrink-0 rounded-lg object-contain"
                suppressHydrationWarning
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-white">
                    Saatvik Cars
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Online
                  </span>
                </div>
                <p className="truncate text-[11px] text-slate-400">
                  Typically replies instantly
                </p>
              </div>

              {/* WhatsApp handoff button */}
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
                suppressHydrationWarning
              >
                <MessageCircle className="h-4 w-4" />
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={toggleChat}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
                suppressHydrationWarning
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ===== Messages area ===== */}
            <div
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              className="saatvik-chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((msg, i) => (
                <MessageBubble
                  key={`${msg.ts}-${i}`}
                  msg={msg}
                  onAction={handleAction}
                />
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {/* ===== Quick replies (only before first user message) ===== */}
            {showQuickReplies && (
              <div className="flex flex-wrap gap-1.5 border-t border-white/10 bg-[#0F0F0F] px-3 py-2">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.label}
                    type="button"
                    onClick={() => sendMessage(qr.send)}
                    className="rounded-full border border-[#00D4FF]/30 px-2.5 py-1 text-xs text-[#00D4FF] transition-colors hover:bg-[#00D4FF]/10 disabled:opacity-50"
                    disabled={isTyping}
                    suppressHydrationWarning
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            {/* ===== Input area ===== */}
            <div className="border-t border-white/10 bg-[#0F0F0F] px-3 py-3">
              <div className="flex items-center gap-2">
                <label htmlFor="saatvik-chat-input" className="sr-only">
                  Type your message
                </label>
                <Input
                  id="saatvik-chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="h-9 flex-1 border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:border-[#00D4FF] focus-visible:ring-[#00D4FF]/20"
                  aria-label="Type a message"
                  autoComplete="off"
                  suppressHydrationWarning
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="h-9 w-9 shrink-0 bg-[#00D4FF] text-[#0A0A0A] hover:bg-[#00B8E6] disabled:opacity-40"
                  suppressHydrationWarning
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-slate-500">
                Powered by Saatvik Cars · Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Floating Action Button ===== */}
      <motion.button
        type="button"
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        whileTap={{ scale: 0.92 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#00D4FF] text-[#0A0A0A] shadow-lg shadow-[#00D4FF]/30 transition-colors hover:bg-[#00B8E6]"
        suppressHydrationWarning
      >
        {/* Pulse ring (only when closed) */}
        {!isOpen && (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-[#00D4FF] opacity-40"
            aria-hidden="true"
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="x-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative"
              suppressHydrationWarning
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="msg-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative"
              suppressHydrationWarning
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread notification badge */}
        {hasUnread && !isOpen && (
          <span
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-[#0A0A0A]"
            aria-label="1 unread message"
            suppressHydrationWarning
          >
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}

// ===== Message bubble sub-component =====
function MessageBubble({
  msg,
  onAction,
}: {
  msg: ChatMessage;
  onAction: (action: ChatAction) => void;
}) {
  const isBot = msg.role === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
      suppressHydrationWarning
    >
      <div
        className={`flex max-w-[85%] items-end gap-2 ${
          isBot ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            isBot
              ? 'bg-[#00D4FF]/10 text-[#00D4FF]'
              : 'bg-white/10 text-slate-300'
          }`}
          aria-hidden="true"
        >
          {isBot ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
        </div>
        <div className="flex flex-col gap-1.5">
          <div
            className={
              isBot
                ? 'rounded-2xl rounded-bl-sm bg-white/5 px-3 py-2 text-sm text-slate-200'
                : 'rounded-2xl rounded-br-sm bg-[#00D4FF] px-3 py-2 text-sm text-[#0A0A0A]'
            }
          >
            {msg.text}
          </div>
          {msg.action && (
            <button
              type="button"
              onClick={() => onAction(msg.action!)}
              className="self-start rounded-full border border-[#00D4FF]/30 px-3 py-1 text-xs text-[#00D4FF] transition-colors hover:bg-[#00D4FF]/10"
              suppressHydrationWarning
            >
              {msg.action.label}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ===== Typing indicator (3-dot bounce) =====
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2"
      suppressHydrationWarning
    >
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00D4FF]/10 text-[#00D4FF]"
        aria-hidden="true"
      >
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3"
        aria-label="Saatvik assistant is typing"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
            suppressHydrationWarning
          />
        ))}
      </div>
    </motion.div>
  );
}
