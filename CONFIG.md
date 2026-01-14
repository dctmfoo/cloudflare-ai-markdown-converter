# Format Configuration Guide

## Location
`public/config.js` - Controls which file formats are supported

## Cost Tiers

### Low Cost (Single AI Model)
- PDF, HTML, XML, Office docs, CSV, etc.
- Direct conversion using one AI pass

### High Cost (Multiple AI Models)
- **Images** (JPEG, PNG, WebP, SVG)
- Uses 2 models per image:
  1. Object detection
  2. Image summarization
- Can get expensive quickly

## How to Enable/Disable Formats

Edit `public/config.js`:

```javascript
"images": {
  "enabled": false,  // ← Change to true to enable
  "extensions": [".jpg", ".jpeg", ".png", ".webp", ".svg"],
  // ...
}
```

## Configuration Options

Each format category has:

| Field | Description |
|-------|-------------|
| `enabled` | `true/false` - Controls if format is supported |
| `extensions` | Array of file extensions |
| `mimeTypes` | Array of MIME types for validation |
| `costTier` | `"low"` or `"high"` - Cost indicator |
| `label` | Display name shown in UI badges |
| `note` | Optional explanation (e.g., why it's expensive) |

## Available Format Categories

1. **pdf** - PDF documents
2. **images** - Image files (⚠️ HIGH COST)
3. **html** - HTML documents
4. **xml** - XML documents
5. **office** - Microsoft Office (Word, Excel)
6. **openDocument** - Open Document Format
7. **csv** - CSV files
8. **apple** - Apple Numbers

## After Changing Config

1. Edit `public/config.js`
2. Build: `npm run build`
3. Deploy: `npm run deploy`

The UI will automatically:
- Update file input accept types
- Show/hide format badges
- Reflect changes immediately

## Current Configuration

✅ **Enabled on this instance:** PDF, HTML, XML, Office, OpenDocument, CSV, Apple  
⚠️ **Supported by Cloudflare but disabled here:** Images (to control costs)

**Note:** All formats listed are technically supported by Cloudflare Workers AI. The configuration here only controls which formats THIS deployment accepts.

## Example: Enable Images

```javascript
"images": {
  "enabled": true,  // Changed from false
  "extensions": [".jpg", ".jpeg", ".png", ".webp", ".svg"],
  "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  "costTier": "high",
  "label": "Images",
  "note": "Uses 2 AI models per image (object detection + summarization)"
}
```

## Cost Management Tips

1. **Monitor Usage:** Check Cloudflare dashboard for AI credit usage
2. **Disable High-Cost Formats:** Turn off images if costs spike
3. **Turnstile Protection:** Already enabled to prevent bot abuse
4. **Set Limits:** Consider adding file size limits in backend
