#!/usr/bin/env python3
"""
Enhanced script to detect and remove duplicate FAQ objects.
Can compare by question only, or by both question and answer fields.
Logs any removed entries for review.
"""

import json
import argparse
from typing import List, Dict, Any, Tuple
from datetime import datetime

def normalize_text(text: str) -> str:
    """Normalize text by converting to lowercase and trimming whitespace."""
    return text.lower().strip()

def create_duplicate_key(faq: Dict[str, Any], check_answer: bool = False) -> str:
    """Create a key for duplicate detection based on question and optionally answer."""
    question = normalize_text(faq.get('question', ''))
    if check_answer:
        answer = normalize_text(faq.get('answer', ''))
        return f"{question}|{answer}"
    return question

def detect_and_remove_duplicates(faqs: List[Dict[str, Any]], check_answer: bool = False) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Detect and remove duplicate FAQs based on normalized question field (and optionally answer).
    
    Args:
        faqs: List of FAQ objects
        check_answer: If True, also consider answer field for duplicate detection
        
    Returns:
        Tuple of (unique_faqs, removed_duplicates)
    """
    seen_keys = {}
    unique_faqs = []
    removed_duplicates = []
    
    comparison_type = "question and answer" if check_answer else "question only"
    print(f"Checking for duplicates using: {comparison_type}")
    
    for i, faq in enumerate(faqs):
        duplicate_key = create_duplicate_key(faq, check_answer)
        
        if duplicate_key in seen_keys:
            # This is a duplicate
            original_index = seen_keys[duplicate_key]
            duplicate_info = {
                'original_index': original_index,
                'duplicate_index': i,
                'original_faq': faqs[original_index],
                'duplicate_faq': faq,
                'comparison_key': duplicate_key,
                'comparison_type': comparison_type
            }
            removed_duplicates.append(duplicate_info)
            print(f"Found duplicate (index {i}):")
            print(f"  Question: '{faq.get('question', '')}'")
            if check_answer:
                print(f"  Answer: '{faq.get('answer', '')[:100]}...'")
            print(f"  Original at index {original_index}")
        else:
            # This is unique, keep it
            seen_keys[duplicate_key] = i
            unique_faqs.append(faq)
    
    return unique_faqs, removed_duplicates

def find_similar_questions(faqs: List[Dict[str, Any]], similarity_threshold: float = 0.8) -> List[Dict[str, Any]]:
    """
    Find questions that are very similar but not exact duplicates.
    Uses basic string similarity (Jaccard similarity on words).
    """
    from collections import Counter
    import re
    
    def get_words(text: str) -> set:
        """Extract words from text."""
        words = re.findall(r'\b\w+\b', text.lower())
        return set(words)
    
    def jaccard_similarity(set1: set, set2: set) -> float:
        """Calculate Jaccard similarity between two sets."""
        if not set1 and not set2:
            return 1.0
        if not set1 or not set2:
            return 0.0
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union
    
    similar_pairs = []
    
    for i, faq1 in enumerate(faqs):
        words1 = get_words(faq1.get('question', ''))
        
        for j, faq2 in enumerate(faqs[i+1:], i+1):
            words2 = get_words(faq2.get('question', ''))
            
            similarity = jaccard_similarity(words1, words2)
            if similarity >= similarity_threshold:
                similar_pairs.append({
                    'index1': i,
                    'index2': j,
                    'question1': faq1.get('question', ''),
                    'question2': faq2.get('question', ''),
                    'similarity': similarity,
                    'faq1': faq1,
                    'faq2': faq2
                })
    
    return similar_pairs

def save_detailed_log(removed_duplicates: List[Dict[str, Any]], similar_questions: List[Dict[str, Any]], log_file: str):
    """Save detailed log of removed duplicates and similar questions."""
    log_data = {
        'timestamp': datetime.now().isoformat(),
        'total_duplicates_removed': len(removed_duplicates),
        'total_similar_questions_found': len(similar_questions),
        'duplicates': removed_duplicates,
        'similar_questions': similar_questions
    }
    
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, indent=2, ensure_ascii=False)
    
    print(f"Detailed log saved to: {log_file}")

def main():
    parser = argparse.ArgumentParser(description='Detect and remove duplicate FAQ objects')
    parser.add_argument('--check-answer', action='store_true', 
                       help='Also consider answer field for duplicate detection')
    parser.add_argument('--find-similar', action='store_true',
                       help='Also find similar (but not exact) questions')
    parser.add_argument('--input', default='data/faqs.json',
                       help='Input FAQ JSON file (default: data/faqs.json)')
    parser.add_argument('--output', default='data/faqs_deduplicated.json',
                       help='Output deduplicated FAQ JSON file')
    parser.add_argument('--log', default='duplicate_removal_log.json',
                       help='Log file for removed duplicates')
    
    args = parser.parse_args()
    
    # Load the FAQ data
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            faqs = json.load(f)
        print(f"Loaded {len(faqs)} FAQs from {args.input}")
    except FileNotFoundError:
        print(f"Error: File {args.input} not found")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {args.input}: {e}")
        return
    
    # Detect and remove duplicates
    unique_faqs, removed_duplicates = detect_and_remove_duplicates(faqs, args.check_answer)
    
    # Find similar questions if requested
    similar_questions = []
    if args.find_similar:
        print("\nLooking for similar questions...")
        similar_questions = find_similar_questions(unique_faqs)
    
    # Print summary
    print(f"\nDuplicate Detection Summary:")
    print(f"  Original FAQs: {len(faqs)}")
    print(f"  Unique FAQs: {len(unique_faqs)}")
    print(f"  Duplicates removed: {len(removed_duplicates)}")
    
    if args.find_similar:
        print(f"  Similar questions found: {len(similar_questions)}")
    
    if removed_duplicates:
        print(f"\nDuplicate Questions Found:")
        for i, dup in enumerate(removed_duplicates, 1):
            print(f"  {i}. '{dup['duplicate_faq']['question']}'")
            print(f"     (duplicate of FAQ at index {dup['original_index']})")
    else:
        print("\nNo exact duplicates found!")
    
    if similar_questions:
        print(f"\nSimilar Questions Found:")
        for i, sim in enumerate(similar_questions, 1):
            print(f"  {i}. Similarity: {sim['similarity']:.2f}")
            print(f"     Question 1 (index {sim['index1']}): '{sim['question1']}'")
            print(f"     Question 2 (index {sim['index2']}): '{sim['question2']}'")
    
    # Save results
    if removed_duplicates or similar_questions:
        if removed_duplicates:
            # Save deduplicated FAQs
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(unique_faqs, f, indent=2, ensure_ascii=False)
            print(f"\nDeduplicated FAQs saved to: {args.output}")
        
        # Save detailed log
        save_detailed_log(removed_duplicates, similar_questions, args.log)
        
        if removed_duplicates:
            print(f"\nReview the log file to see details of removed duplicates.")
            print(f"If the results look correct, you can replace the original file with:")
            print(f"  mv {args.output} {args.input}")
    else:
        print("\nNo duplicates or similar questions found, no action needed.")

if __name__ == '__main__':
    main()
