#!/usr/bin/env python3
"""
Script to detect and remove duplicate FAQ objects.
Compares lowercase-trimmed "question" field and keeps only one instance of each.
Logs any removed entries for review.
"""

import json
import os
from typing import List, Dict, Any
from datetime import datetime

def normalize_question(question: str) -> str:
    """Normalize question by converting to lowercase and trimming whitespace."""
    return question.lower().strip()

def detect_and_remove_duplicates(faqs: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Detect and remove duplicate FAQs based on normalized question field.
    
    Args:
        faqs: List of FAQ objects
        
    Returns:
        Tuple of (unique_faqs, removed_duplicates)
    """
    seen_questions = {}
    unique_faqs = []
    removed_duplicates = []
    
    for i, faq in enumerate(faqs):
        question = faq.get('question', '')
        normalized_question = normalize_question(question)
        
        if normalized_question in seen_questions:
            # This is a duplicate
            original_index = seen_questions[normalized_question]
            duplicate_info = {
                'original_index': original_index,
                'duplicate_index': i,
                'original_faq': faqs[original_index],
                'duplicate_faq': faq,
                'normalized_question': normalized_question
            }
            removed_duplicates.append(duplicate_info)
            print(f"Found duplicate question (index {i}): '{question}'")
            print(f"  Original at index {original_index}: '{faqs[original_index]['question']}'")
        else:
            # This is unique, keep it
            seen_questions[normalized_question] = i
            unique_faqs.append(faq)
    
    return unique_faqs, removed_duplicates

def save_duplicate_log(removed_duplicates: List[Dict[str, Any]], log_file: str):
    """Save detailed log of removed duplicates."""
    log_data = {
        'timestamp': datetime.now().isoformat(),
        'total_duplicates_removed': len(removed_duplicates),
        'duplicates': removed_duplicates
    }
    
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, indent=2, ensure_ascii=False)
    
    print(f"Duplicate log saved to: {log_file}")

def main():
    input_file = 'data/faqs.json'
    output_file = 'data/faqs_deduplicated.json'
    log_file = 'duplicate_removal_log.json'
    
    # Load the FAQ data
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            faqs = json.load(f)
        print(f"Loaded {len(faqs)} FAQs from {input_file}")
    except FileNotFoundError:
        print(f"Error: File {input_file} not found")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}")
        return
    
    # Detect and remove duplicates
    unique_faqs, removed_duplicates = detect_and_remove_duplicates(faqs)
    
    # Print summary
    print(f"\nDuplicate Detection Summary:")
    print(f"  Original FAQs: {len(faqs)}")
    print(f"  Unique FAQs: {len(unique_faqs)}")
    print(f"  Duplicates removed: {len(removed_duplicates)}")
    
    if removed_duplicates:
        print(f"\nDuplicate Questions Found:")
        for i, dup in enumerate(removed_duplicates, 1):
            print(f"  {i}. '{dup['duplicate_faq']['question']}'")
            print(f"     (duplicate of FAQ at index {dup['original_index']})")
    else:
        print("\nNo duplicates found!")
    
    # Save results
    if removed_duplicates:
        # Save deduplicated FAQs
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unique_faqs, f, indent=2, ensure_ascii=False)
        print(f"\nDeduplicated FAQs saved to: {output_file}")
        
        # Save duplicate log
        save_duplicate_log(removed_duplicates, log_file)
        
        print(f"\nReview the log file to see details of removed duplicates.")
        print(f"If the results look correct, you can replace the original file with:")
        print(f"  mv {output_file} {input_file}")
    else:
        print("\nNo duplicates found, no action needed.")

if __name__ == '__main__':
    main()
