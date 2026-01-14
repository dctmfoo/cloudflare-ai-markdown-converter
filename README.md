# Markdown Converter

Convert various file formats to Markdown using Cloudflare Workers AI.

**Live Demo:** https://cf-markdown.pages.dev/

## How It Works

This application uses Cloudflare's **[Workers AI Markdown Conversion](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/)** feature, which provides the `env.AI.toMarkdown()` method to convert documents in multiple formats to Markdown. The conversion uses AI models for intelligent document parsing and image analysis.

**Learn more:** [Cloudflare Workers AI - Markdown Conversion Documentation](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/)

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

**Optional:** Set up [Cloudflare Turnstile](./TURNSTILE_SETUP.md) to protect against bots and abuse. 

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

### Project Structure

The backend logic is available in two versions:
- `src/index.ts` - TypeScript version with type definitions
- `public/_worker.js` - Production version (auto-generated from build, deployed to Cloudflare Pages Functions)

### Available Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Type check without building
npm run typecheck

# Run tests
npm test

# Build and deploy
npm run deploy

# Deploy only (without build)
wrangler pages deploy public --project-name=cf-markdown
```

### Local Development

To test locally with Wrangler:
```bash
wrangler pages dev public
```

**Note:** The `public/_worker.js` file is auto-generated during build. Edit `src/index.ts` instead and run `npm run build`.

## License

ISC
