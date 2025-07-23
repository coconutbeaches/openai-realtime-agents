import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { searchFaq } from '@/lib/faq';

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
    const results = await searchFaq((input as any).query);
    return { results };
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
  instructions: `You are Coco, Coconut Beach hotel's friendly multilingual concierge. Speak in the same language as the guest (English, German, or French). Always sound calm and pleasant. At the start of each session, ask for the guest's name politely and remember it for logging and escalation. Use the lookupFAQ tool to search for answers and respond conversationally, not verbatim. If multiple FAQ matches are found, mention the best answer first and briefly offer others. If you cannot find a clear match, provide a commonsense answer if possible. If unsure, ask if the guest would like to connect to staff. When the user specifically asks for help from a human, call escalateToStaff. Ask the guest to repeat if their speech overlaps with yours. End the conversation silently if they stop responding for about 90 seconds.`,
  tools: [lookupFAQ, escalateTool],
  handoffs: [],
  handoffDescription: 'Coconut Beach concierge'
});

export const cocoScenario = [cocoAgent];
