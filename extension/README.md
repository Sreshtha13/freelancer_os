# Apply Assistant — Chrome Extension (Bonus)

Safe extension: **no auto-apply**, only copy proposal to clipboard on supported job pages.

## Planned features

1. Content script detects page title + selected text
2. Popup: link to Freelancer OS job import API
3. Inject "Paste proposal" button near textarea fields (user-triggered)
4. Auth via Supabase session cookie or extension OAuth

## manifest.json (stub)

```json
{
  "manifest_version": 3,
  "name": "Freelancer OS Apply Assistant",
  "version": "0.1.0",
  "permissions": ["activeTab", "clipboardWrite"],
  "action": { "default_popup": "popup.html" },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }]
}
```

## Policy

- Never auto-fill without user click
- Never submit forms programmatically
- Do not inject on LinkedIn/Upwork logged-in areas beyond clipboard helper
