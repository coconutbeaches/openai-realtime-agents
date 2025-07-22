#!/usr/bin/env python3
"""
Script to load and parse faqs.json into a list of dictionaries for processing.
"""

import json
import os
from typing import List, Dict, Any


def load_faqs(file_path: str) -> List[Dict[str, Any]]:
    """
    Load the faqs.json file and parse it into a list of dictionaries.
    
    Args:
        file_path (str): Path to the faqs.json file
        
    Returns:
        List[Dict[str, Any]]: List of FAQ dictionaries
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        json.JSONDecodeError: If the JSON is invalid
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"FAQ file not found at: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            faqs = json.load(file)
        
        if not isinstance(faqs, list):
            raise ValueError("Expected FAQ data to be a list")
            
        print(f"Successfully loaded {len(faqs)} FAQs from {file_path}")
        return faqs
        
    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(f"Invalid JSON in {file_path}: {e}")


def display_faq_summary(faqs: List[Dict[str, Any]]) -> None:
    """
    Display a summary of the loaded FAQs.
    
    Args:
        faqs (List[Dict[str, Any]]): List of FAQ dictionaries
    """
    print(f"\n=== FAQ Summary ===")
    print(f"Total FAQs: {len(faqs)}")
    
    # Get unique categories
    categories = set()
    for faq in faqs:
        if 'category' in faq:
            categories.add(faq['category'])
    
    print(f"Categories: {len(categories)}")
    for category in sorted(categories):
        count = sum(1 for faq in faqs if faq.get('category') == category)
        print(f"  - {category}: {count} FAQs")
    
    # Show structure of first FAQ
    if faqs:
        print(f"\nSample FAQ structure:")
        sample_faq = faqs[0]
        for key, value in sample_faq.items():
            if isinstance(value, list):
                print(f"  {key}: {type(value).__name__} with {len(value)} items")
            else:
                print(f"  {key}: {type(value).__name__}")


def main():
    """
    Main function to demonstrate loading and processing the FAQs.
    """
    # Path to the faqs.json file
    faqs_file_path = "/Users/tyler/Projects/openai-realtime-agents/data/faqs.json"
    
    try:
        # Load the FAQs
        faqs_list = load_faqs(faqs_file_path)
        
        # Display summary information
        display_faq_summary(faqs_list)
        
        # Example processing: Show first few FAQs
        print(f"\n=== Sample FAQs ===")
        for i, faq in enumerate(faqs_list[:3]):  # Show first 3 FAQs
            print(f"\nFAQ {i+1}:")
            print(f"  Category: {faq.get('category', 'N/A')}")
            print(f"  Question: {faq.get('question', 'N/A')}")
            print(f"  Keywords: {faq.get('keywords', [])}")
            print(f"  Answer: {faq.get('answer', 'N/A')[:100]}...")  # First 100 chars
        
        # Return the loaded data for further processing
        return faqs_list
        
    except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
        print(f"Error loading FAQs: {e}")
        return None


if __name__ == "__main__":
    faqs_data = main()
    
    # Example of how to use the loaded data for processing
    if faqs_data:
        print(f"\n=== Ready for Processing ===")
        print(f"FAQs loaded successfully and ready for processing!")
        print(f"Access the data using the 'faqs_data' variable")
        print(f"Each FAQ is a dictionary with keys: {list(faqs_data[0].keys()) if faqs_data else 'None'}")
