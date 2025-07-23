import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { faqs, FAQ } from './faqs';

const lookupFAQ = tool({
  name: 'lookupFAQ',
  description: 'Search Coconut Beach FAQ for an answer to the guest question.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Guest question' },
    },
    required: ['query'],
    additionalProperties: false,
  },
  execute: async (input: any) => {
    const { query } = input as { query: string };
    const q = query.toLowerCase();

    let best: FAQ | null = null;
    let bestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      if (faq.question.toLowerCase().includes(q)) score += 2;
      for (const k of faq.keywords) {
        if (q.includes(k.toLowerCase())) score += 1;
      }
      if (score > bestScore) {
        best = faq;
        bestScore = score;
      }
    }

    return { answer: best && bestScore > 0 ? best.answer : null };
  },
});

const escalateTool = tool({
  name: 'escalateToStaff',
  description: 'Notify human staff via WhatsApp when guest requests help.',
  parameters: {
    type: 'object',
    properties: {
      guestName: { type: 'string' },
      question: { type: 'string' },
    },
    required: ['guestName', 'question'],
    additionalProperties: false,
  },
  execute: async (input: any) => {
    const { guestName, question } = input as { guestName: string; question: string };
    const res = await fetch('/api/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, question }),
    });
    return { success: res.ok };
  },
});

export const cocoAgent = new RealtimeAgent({
  name: 'coco',
  voice: 'cove',
  instructions: `You are Coco, Coconut Beach hotel's friendly multilingual concierge. Speak in the same language as the guest (English, German, or French). Always sound calm and pleasant. At the start of each session, ask for the guest's name politely and remember it for logging and escalation. When a guest asks a question, first call the lookupFAQ tool to search for an answer and respond conversationally in your own words. If multiple FAQ matches are found, mention the best answer first and briefly offer others. If no good match is found, fall back to your general knowledge. If you are unsure whether the guest found the answer helpful, ask “Was this answer helpful?”. When the user specifically asks for help from a human, call escalateToStaff. Ask the guest to repeat if their speech overlaps with yours. End the conversation silently if they stop responding for about 90 seconds.`,
  tools: [lookupFAQ, escalateTool],
  handoffs: [],
  handoffDescription: 'Coconut Beach concierge'
});

export const cocoScenario = [cocoAgent];
