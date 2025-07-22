import json
import unittest
import os
from collections import Counter

class TestFlatFaqsJson(unittest.TestCase):
    def setUp(self):
        # Get the directory of this test file
        test_dir = os.path.dirname(__file__)
        # Navigate to the data directory relative to test directory
        faq_path = os.path.join(test_dir, '..', 'data', 'flat_faqs.json')
        
        with open(faq_path) as f:
            self.data = json.load(f)

    def test_json_is_valid(self):
        """Test that the JSON file is valid and loads correctly."""
        self.assertIsInstance(self.data, list, "FAQ data should be a list.")
        self.assertTrue(len(self.data) > 0, "FAQ data should not be empty.")

    def test_entry_count(self):
        """Test the total number of FAQ entries."""
        actual_count = len(self.data)
        print(f"Actual entry count: {actual_count}")
        self.assertTrue(actual_count > 0, "There should be at least 1 entry in the FAQ.")

    def test_unique_questions(self):
        """Test that all questions are unique."""
        questions = [entry['question'] for entry in self.data]
        question_counts = Counter(questions)
        duplicates = [q for q, count in question_counts.items() if count > 1]
        
        if duplicates:
            print(f"Duplicate questions found: {duplicates}")
            
        self.assertEqual(len(duplicates), 0, f"Found {len(duplicates)} duplicate questions: {duplicates}")

    def test_required_fields(self):
        """Test that each entry has the required fields."""
        required_fields = ['category', 'question', 'keywords', 'answer']
        
        for i, entry in enumerate(self.data):
            for field in required_fields:
                self.assertIn(field, entry, f"Entry {i} is missing required field: {field}")
                
    def test_field_types(self):
        """Test that fields have the correct data types."""
        for i, entry in enumerate(self.data):
            self.assertIsInstance(entry['category'], str, f"Entry {i}: category should be a string")
            self.assertIsInstance(entry['question'], str, f"Entry {i}: question should be a string")
            self.assertIsInstance(entry['keywords'], list, f"Entry {i}: keywords should be a list")
            self.assertIsInstance(entry['answer'], str, f"Entry {i}: answer should be a string")
            
            # Check that keywords are all strings
            for j, keyword in enumerate(entry['keywords']):
                self.assertIsInstance(keyword, str, f"Entry {i}, keyword {j}: should be a string")

    def test_non_empty_fields(self):
        """Test that required fields are not empty."""
        for i, entry in enumerate(self.data):
            self.assertTrue(entry['category'].strip(), f"Entry {i}: category should not be empty")
            self.assertTrue(entry['question'].strip(), f"Entry {i}: question should not be empty")
            self.assertTrue(len(entry['keywords']) > 0, f"Entry {i}: keywords should not be empty")
            self.assertTrue(entry['answer'].strip(), f"Entry {i}: answer should not be empty")

if __name__ == '__main__':
    unittest.main()
