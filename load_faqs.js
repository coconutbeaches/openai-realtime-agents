#!/usr/bin/env node
/**
 * Script to load and parse faqs.json into an array of objects for processing.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load the faqs.json file and parse it into an array of objects.
 * 
 * @param {string} filePath - Path to the faqs.json file
 * @returns {Object[]} Array of FAQ objects
 * @throws {Error} If the file doesn't exist or JSON is invalid
 */
function loadFaqs(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`FAQ file not found at: ${filePath}`);
    }
    
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const faqs = JSON.parse(fileContent);
        
        if (!Array.isArray(faqs)) {
            throw new Error('Expected FAQ data to be an array');
        }
        
        console.log(`Successfully loaded ${faqs.length} FAQs from ${filePath}`);
        return faqs;
        
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Display a summary of the loaded FAQs.
 * 
 * @param {Object[]} faqs - Array of FAQ objects
 */
function displayFaqSummary(faqs) {
    console.log('\n=== FAQ Summary ===');
    console.log(`Total FAQs: ${faqs.length}`);
    
    // Get unique categories
    const categories = new Set();
    faqs.forEach(faq => {
        if (faq.category) {
            categories.add(faq.category);
        }
    });
    
    console.log(`Categories: ${categories.size}`);
    
    // Count FAQs per category
    const sortedCategories = Array.from(categories).sort();
    sortedCategories.forEach(category => {
        const count = faqs.filter(faq => faq.category === category).length;
        console.log(`  - ${category}: ${count} FAQs`);
    });
    
    // Show structure of first FAQ
    if (faqs.length > 0) {
        console.log('\nSample FAQ structure:');
        const sampleFaq = faqs[0];
        Object.entries(sampleFaq).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                console.log(`  ${key}: Array with ${value.length} items`);
            } else {
                console.log(`  ${key}: ${typeof value}`);
            }
        });
    }
}

/**
 * Main function to demonstrate loading and processing the FAQs.
 */
function main() {
    // Path to the faqs.json file
    const faqsFilePath = '/Users/tyler/Projects/openai-realtime-agents/data/faqs.json';
    
    try {
        // Load the FAQs
        const faqsList = loadFaqs(faqsFilePath);
        
        // Display summary information
        displayFaqSummary(faqsList);
        
        // Example processing: Show first few FAQs
        console.log('\n=== Sample FAQs ===');
        faqsList.slice(0, 3).forEach((faq, index) => {
            console.log(`\nFAQ ${index + 1}:`);
            console.log(`  Category: ${faq.category || 'N/A'}`);
            console.log(`  Question: ${faq.question || 'N/A'}`);
            console.log(`  Keywords: ${JSON.stringify(faq.keywords || [])}`);
            console.log(`  Answer: ${(faq.answer || 'N/A').substring(0, 100)}...`);
        });
        
        // Return the loaded data for further processing
        return faqsList;
        
    } catch (error) {
        console.error(`Error loading FAQs: ${error.message}`);
        return null;
    }
}

// Run the script if executed directly
if (require.main === module) {
    const faqsData = main();
    
    // Example of how to use the loaded data for processing
    if (faqsData) {
        console.log('\n=== Ready for Processing ===');
        console.log('FAQs loaded successfully and ready for processing!');
        console.log("Access the data using the 'faqsData' variable");
        console.log(`Each FAQ is an object with keys: ${faqsData.length > 0 ? JSON.stringify(Object.keys(faqsData[0])) : 'None'}`);
    }
}

// Export functions for use as a module
module.exports = {
    loadFaqs,
    displayFaqSummary,
    main
};
