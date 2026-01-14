# Markdown Converter

Convert various file formats to Markdown using Cloudflare Workers AI.

**Live Demo:** https://cf-markdown.pages.dev/

## How It Works

This application uses Cloudflare's [Workers AI Markdown Conversion](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/) feature, which provides the `env.AI.toMarkdown()` method to convert documents in multiple formats to Markdown. The conversion uses AI models for intelligent document parsing and image analysis.

## Supported Formats

- PDF Documents (`.pdf`)
- Images (`.jpeg`, `.jpg`, `.png`, `.webp`, `.svg`)
- HTML Documents (`.html`)
- XML Documents (`.xml`)
- Microsoft Office Documents (`.xlsx`, `.xlsm`, `.xlsb`, `.xls`, `.docx`)
- Open Document Format (`.ods`, `.odt`)
- CSV (`.csv`)
- Apple Documents (`.numbers`)

## Features

- 📤 Upload multiple files at once
- 🔄 Convert to Markdown using Cloudflare Workers AI
- 👀 Preview converted Markdown
- 📋 Copy all to clipboard
- 💾 Download as `.md` file

## Setup

### Prerequisites

You need a Cloudflare account with Workers AI enabled. 

1. **Authenticate with Cloudflare:**
```bash
wrangler login
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Create Cloudflare Pages project:**
```bash
wrangler pages project create cf-markdown --production-branch=main
```

5. **Deploy to Cloudflare Pages:**
```bash
npm run deploy
# or manually:
wrangler pages deploy public --project-name=cf-markdown
```

The AI binding is already configured in `wrangler.toml`.

## API Endpoint

### POST /api/convert

Upload files for conversion to Markdown.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with files

**Response:**
```json
[
  {
    "name": "document.pdf",
    "format": "markdown",
    "mimetype": "application/pdf",
    "tokens": 150,
    "data": "# Document Title\\n\\nContent..."
  }
]
```

## Development

The backend logic is available in two versions:
- `src/index.ts` - TypeScript version with type definitions
- `public/_worker.js` - Production version (deployed to Cloudflare Pages Functions)

To deploy:
```bash
wrangler pages deploy public --project-name=cf-markdown
```

To run tests:
```bash
npm test
```

## License

ISC
