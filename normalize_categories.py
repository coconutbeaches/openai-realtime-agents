#!/usr/bin/env python3
"""
Script to normalize category values in FAQs JSON file.
Converts every "category" string to lowercase and trims whitespace.
"""

import json

def normalize_categories(input_file, output_file):
    """
    Read FAQs JSON file, normalize category values, and write back.
    
    Args:
        input_file (str): Path to input JSON file
        output_file (str): Path to output JSON file
    """
    
    # Read the JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        faqs = json.load(f)
    
    print(f"Processing {len(faqs)} FAQ entries...")
    
    # Track unique categories before and after normalization
    original_categories = set()
    normalized_categories = set()
    changes_made = 0
    
    # Normalize each category
    for faq in faqs:
        original_category = faq['category']
        original_categories.add(original_category)
        
        # Convert to lowercase and trim whitespace
        normalized_category = original_category.strip().lower()
        
        if original_category != normalized_category:
            changes_made += 1
            print(f"Changed: '{original_category}' -> '{normalized_category}'")
        
        faq['category'] = normalized_category
        normalized_categories.add(normalized_category)
    
    # Write the normalized data back to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(faqs, f, indent=2, ensure_ascii=False)
    
    print(f"\nSummary:")
    print(f"- Total FAQs processed: {len(faqs)}")
    print(f"- Changes made: {changes_made}")
    print(f"- Original unique categories: {len(original_categories)}")
    print(f"- Normalized unique categories: {len(normalized_categories)}")
    
    print(f"\nOriginal categories:")
    for cat in sorted(original_categories):
        print(f"  - '{cat}'")
    
    print(f"\nNormalized categories:")
    for cat in sorted(normalized_categories):
        print(f"  - '{cat}'")
    
    print(f"\nFile saved as: {output_file}")

if __name__ == "__main__":
    input_file = "data/faqs.json"
    output_file = "data/faqs.json"  # Overwrite the original file
    
    normalize_categories(input_file, output_file)
