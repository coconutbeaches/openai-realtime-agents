import data from '../../../data/flat_faqs.json';

export interface FAQ {
  category: string;
  question: string;
  keywords: string[];
  answer: string;
  embedding?: number[];
}

export const faqs: FAQ[] = data as FAQ[];
