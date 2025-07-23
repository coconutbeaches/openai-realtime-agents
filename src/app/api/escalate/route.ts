import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsappMessage } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const { guestName, question } = await req.json();
    const message = `A guest named ${guestName} needs help with: ${question}. Please respond ASAP.`;
    const res = await sendWhatsappMessage(message);
    return NextResponse.json({ success: res.ok });
  } catch (err) {
    console.error('escalation error', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
