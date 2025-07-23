import {
  RealtimeAgent,
  tool,
} from '@openai/agents/realtime';

import faqs from '../../../data/flat_faqs.json';

const lookupFaq = tool({
  name: 'lookupFAQ',
  description:
    'Look up an answer from the resort FAQ list using a question or keyword.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The user question or keywords to search for.',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
  execute: async (input: any) => {
    const { query } = input as { query: string };
    const q = query.toLowerCase();
    const match = (faqs as any[]).find(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        (faq.keywords || []).some((k: string) =>
          k.toLowerCase().includes(q) || q.includes(k.toLowerCase()),
        ),
    );
    return { answer: match ? match.answer : null };
  },
});

export const resortAgent = new RealtimeAgent({
  name: 'resortAgent',
  voice: 'alloy',
  instructions:
    'You help guests at a tropical resort. Answer questions about amenities and services. Use the lookupFAQ tool whenever possible.',
  handoffs: [],
  tools: [lookupFaq],
  handoffDescription: 'Resort helper agent',
});

export const resortHelperScenario = [resortAgent];
