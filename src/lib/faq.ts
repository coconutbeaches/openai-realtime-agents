import faqs from '../../data/faqs.json';

export interface FAQ {
  category: string;
  question: string;
  keywords: string[];
  answer: string;
  embedding?: number[];
}

const faqsData: FAQ[] = faqs as any;

export function searchFaq(query: string, topN = 3): FAQ[] {
  const q = query.toLowerCase();
  const scored = faqsData.map((f) => {
    let score = 0;
    if (f.question.toLowerCase().includes(q)) score += 2;
    f.keywords.forEach((k) => {
      if (q.includes(k.toLowerCase())) score += 1;
    });
    return { faq: f, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, topN).map((s) => s.faq);
}

export { faqsData as faqs };
