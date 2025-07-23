# FAQ Data Management

This directory contains FAQ data and documentation for managing frequently asked questions.

## JSON Format

FAQs are stored in JSON format with the following structure:

### FAQ Entry Schema

```json
{
  "id": "unique-identifier",
  "question": "The question text",
  "answer": "The detailed answer text",
  "category": "category-name",
  "tags": ["tag1", "tag2", "tag3"],
  "priority": 1,
  "created": "2024-01-01T00:00:00Z",
  "updated": "2024-01-01T00:00:00Z",
  "status": "active"
}
```

### Field Descriptions

- **id**: Unique string identifier for the FAQ entry (required)
- **question**: The question text as users would ask it (required)
- **answer**: The complete answer text, supports markdown formatting (required)
- **category**: Category for grouping related FAQs (optional)
- **tags**: Array of tags for better searchability (optional)
- **priority**: Integer priority for ordering (1 = highest priority) (optional, default: 999)
- **created**: ISO 8601 timestamp when the FAQ was created (required)
- **updated**: ISO 8601 timestamp when the FAQ was last modified (required)
- **status**: Status of the FAQ entry - "active", "draft", or "archived" (optional, default: "active")

### Full FAQ Collection Format

```json
{
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2024-01-01T00:00:00Z",
    "totalEntries": 10
  },
  "faqs": [
    {
      "id": "general-001",
      "question": "How do I get started?",
      "answer": "To get started, simply...",
      "category": "general",
      "tags": ["getting-started", "basics"],
      "priority": 1,
      "created": "2024-01-01T00:00:00Z",
      "updated": "2024-01-01T00:00:00Z",
      "status": "active"
    }
  ]
}
```

## Workflow for Adding/Editing FAQs

### Adding New FAQs

1. **Open the FAQ file**: Locate the appropriate JSON file (e.g., `faqs.json`)

2. **Generate unique ID**: Create a unique identifier following the pattern: `{category}-{number}` (e.g., "general-001", "technical-005")

3. **Add the new entry**: Insert the new FAQ object into the `faqs` array:
   ```json
   {
     "id": "new-unique-id",
     "question": "Your question here",
     "answer": "Your detailed answer here",
     "category": "appropriate-category",
     "tags": ["relevant", "tags"],
     "priority": 10,
     "created": "2024-01-01T00:00:00Z",
     "updated": "2024-01-01T00:00:00Z",
     "status": "active"
   }
   ```

4. **Update metadata**: Increment the `totalEntries` count and update `lastUpdated` timestamp

5. **Validate JSON**: Ensure the JSON is valid using a JSON validator

6. **Test integration**: Verify the new FAQ appears correctly in the application

### Editing Existing FAQs

1. **Locate the FAQ**: Find the FAQ entry by its `id`

2. **Make changes**: Update the relevant fields (question, answer, category, tags, priority, status)

3. **Update timestamp**: Change the `updated` field to the current ISO 8601 timestamp

4. **Update metadata**: Update the `lastUpdated` timestamp in the metadata section

### Archiving FAQs

To remove an FAQ without deleting it:

1. Change the `status` field from "active" to "archived"
2. Update the `updated` timestamp
3. The FAQ will no longer appear in active lists but remains in the data for reference

### File Organization

- `faqs.json` - Main FAQ collection
- `categories.json` - List of available categories (optional)
- `tags.json` - List of available tags (optional)
- `archive/` - Directory for backed up versions

## Best Practices

### Content Guidelines

- **Questions**: Write questions as users would naturally ask them
- **Answers**: Provide complete, helpful answers with examples where appropriate
- **Categories**: Use broad, intuitive categories that users can easily understand
- **Tags**: Include relevant keywords users might search for
- **Priority**: Use priority to control display order (lower numbers = higher priority)

### Maintenance

- **Regular Review**: Review FAQs quarterly to ensure accuracy and relevance
- **User Feedback**: Monitor user interactions to identify missing or unclear FAQs
- **Version Control**: Keep FAQ files in version control to track changes
- **Backup**: Maintain backups before making significant changes

### JSON Validation

Always validate JSON before deploying:

```bash
# Using jq to validate JSON
jq . faqs.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"

# Using Node.js
node -e "JSON.parse(require('fs').readFileSync('faqs.json', 'utf8')); console.log('Valid JSON');"
```

## Integration Notes

When integrating FAQ data into applications:

1. **Filter by status**: Only display FAQs with `status: "active"`
2. **Sort by priority**: Order FAQs by priority field (ascending)
3. **Search functionality**: Use question, answer, tags, and category fields for search
4. **Category filtering**: Allow users to filter by category
5. **Cache considerations**: Cache FAQ data appropriately based on update frequency

## Migration and Updates

When updating the FAQ structure:

1. **Backup existing data**: Create a backup before making structural changes
2. **Update schema version**: Increment the version number in metadata
3. **Migration script**: Create scripts to migrate existing data to new format
4. **Backward compatibility**: Ensure applications can handle the new format gracefully

## Support

For questions about FAQ management:
- Check the JSON format against the schema above
- Validate JSON syntax before committing changes
- Test changes in a development environment first
- Document any custom fields or extensions to the base schema
