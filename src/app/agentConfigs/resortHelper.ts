import {
  RealtimeAgent,
} from '@openai/agents/realtime';

export const resortAgent = new RealtimeAgent({
  name: 'resortAgent',
  voice: 'alloy',
  instructions:
    'You help guests at a tropical resort. Answer questions about amenities and services.',
  handoffs: [],
  tools: [],
  handoffDescription: 'Resort helper agent',
});

export const resortHelperScenario = [resortAgent];
