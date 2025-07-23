import { NextRequest, NextResponse } from 'next/server';
import { logInteraction } from '@/lib/logging';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await logInteraction(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('log route error', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
