import { ResortAgent } from '../src/ResortAgent';
import { lookupFAQ } from '../src/lookupFAQ';

jest.mock('../src/lookupFAQ');

describe('ResortAgent', () => {
  let resortAgent: ResortAgent;

  beforeEach(() => {
    resortAgent = new ResortAgent();
  });

  it('should invoke lookupFAQ and return the FAQ answer when asked about pool hours', async () => {
    const question = 'What are the pool hours?';
    const expectedAnswer = 'The pool is open from 8 AM to 8 PM daily.';

    (lookupFAQ as jest.Mock).mockReturnValue(expectedAnswer);

    const answer = await resortAgent.handle(question);

    expect(lookupFAQ).toHaveBeenCalledWith(question);
    expect(answer).toBe(expectedAnswer);
  });
});

