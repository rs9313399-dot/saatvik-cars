import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth';
import { BUSINESS } from '@/lib/business';

/**
 * C16 - Live chat API (for future server-side persistence)
 * ---------------------------------------------------------------
 * NOTE: The LiveChatWidget is currently 100% client-side. This endpoint
 * exists so the same keyword bot logic can be invoked server-side later,
 * and so admins can review past conversations (currently empty since the
 * widget never calls POST - but the schema + endpoint are ready).
 *
 * POST /api/chat  { sessionId, message }
 *   - Saves a ChatMessage row with role:'user'
 *   - Generates + saves the canned bot reply (same keyword logic as widget)
 *   - Returns { sessionId, reply }
 *
 * GET /api/chat  (admin only)
 *   - Returns all chat messages grouped by sessionId, newest first
 */

// ===== Shared bot logic (mirrors the client-side widget) =====
function getBotReply(input: string): string {
  const text = input.toLowerCase().trim();
  const has = (...keys: string[]) => keys.some((k) => text.includes(k));

  if (has('browse', 'cars', 'inventory', 'view', 'see')) {
    return 'Browse the current car listings above. Use the filters, then contact Saatvik Cars to confirm availability.';
  }
  if (has('finance', 'emi', 'loan', 'interest')) {
    return 'Use the loan payment estimate with figures from your lender. It is a calculation, not a loan offer or approval.';
  }
  if (has('sell', 'trade', 'exchange', 'valuation')) {
    return 'Use the Sell or trade a car button to send us your details. Our team can follow up about your request.';
  }
  if (has('test drive', 'drive', 'book', 'try')) {
    return 'Open a car listing and use its test drive request form. Contact us to confirm the visit.';
  }
  if (has('insurance', 'rc', 'service', 'warranty', 'rsa')) {
    return 'Contact our team to ask about paperwork, insurance or other services.';
  }
  if (has('price', 'cost', 'budget', 'rate', 'cheap')) {
    return 'Prices appear on current car listings. Contact us to confirm a car is still available.';
  }
  if (has('contact', 'phone', 'call', 'human', 'talk', 'reach')) {
    const phoneList = BUSINESS.phones.map((p) => p.display).join(', ');
    return `You can reach us at ${phoneList} or email ${BUSINESS.email}. Want me to open WhatsApp?`;
  }
  if (has('hours', 'timing', 'open', 'close', 'when')) {
    return `We're open ${BUSINESS.hours}.`;
  }
  if (has('location', 'address', 'where', 'map', 'locate')) {
    return `Our showroom is in ${BUSINESS.address}. See the map and contact details in the About section.`;
  }
  return `I do not have that information. Contact our team at ${BUSINESS.phones[0].display} or ${BUSINESS.email}.`;
}

// ===== POST - save user message, return + persist bot reply =====
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId =
      typeof body.sessionId === 'string' && body.sessionId.trim()
        ? body.sessionId.trim()
        : null;
    const message =
      typeof body.message === 'string' && body.message.trim()
        ? body.message.trim()
        : null;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 }
      );
    }

    // 1. Persist the user's message
    await db.chatMessage.create({
      data: { sessionId, role: 'user', message },
    });

    // 2. Generate + persist the bot reply
    const reply = getBotReply(message);
    await db.chatMessage.create({
      data: { sessionId, role: 'bot', message: reply },
    });

    return NextResponse.json({ sessionId, reply });
  } catch (err) {
    console.error('[chat POST] error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===== GET - admin-only, all chat sessions grouped by sessionId =====
export async function GET(request: NextRequest) {
  const authed = await checkAuth(request);
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await db.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Group by sessionId
    const sessionsMap = new Map<
      string,
      {
        sessionId: string;
        messageCount: number;
        lastMessageAt: string;
        messages: {
          id: string;
          role: string;
          message: string;
          createdAt: string;
        }[];
      }
    >();

    for (const m of rows) {
      let session = sessionsMap.get(m.sessionId);
      if (!session) {
        session = {
          sessionId: m.sessionId,
          messageCount: 0,
          lastMessageAt: m.createdAt.toISOString(),
          messages: [],
        };
        sessionsMap.set(m.sessionId, session);
      }
      session.messageCount++;
      session.lastMessageAt = m.createdAt.toISOString();
      session.messages.push({
        id: m.id,
        role: m.role,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      });
    }

    // Newest session first
    const sessions = Array.from(sessionsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );

    return NextResponse.json({
      sessions,
      totalSessions: sessions.length,
      totalMessages: rows.length,
    });
  } catch (err) {
    console.error('[chat GET] error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
