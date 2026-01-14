# Cloudflare Turnstile Setup

This application uses Cloudflare Turnstile to protect against bots and prevent API abuse.

## Setup Steps

### 1. Create a Turnstile Site

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Go to **Turnstile** in the sidebar
4. Click **Add Site**
5. Configure:
   - **Site name:** Markdown Converter
   - **Domain:** `cf-markdown.pages.dev` (or your custom domain)
   - **Widget Mode:** Managed
6. Click **Create**

### 2. Get Your Site Key and Secret Key

After creating the site, you'll get:
- **Site Key** (public) - Used in the frontend
- **Secret Key** (private) - Used in the backend

### 3. Update the Frontend

Edit `public/index.html` and replace the test site key:

```html
<div class="cf-turnstile" 
     data-sitekey="YOUR_ACTUAL_SITE_KEY"
     data-callback="onTurnstileSuccess"
     data-theme="dark"></div>
```

Replace `YOUR_ACTUAL_SITE_KEY` with your actual Turnstile site key.

### 4. Configure the Secret Key

Add the secret key to your Cloudflare Pages environment:

```bash
# Using Wrangler CLI
wrangler pages secret put TURNSTILE_SECRET_KEY --project-name=cf-markdown
```

Or via the dashboard:
1. Go to **Workers & Pages** → **cf-markdown**
2. Go to **Settings** → **Environment variables**
3. Add variable:
   - **Name:** `TURNSTILE_SECRET_KEY`
   - **Value:** Your Turnstile secret key
   - **Environment:** Production (and Preview if needed)
4. Save and redeploy

### 5. Testing

**Test Site Key (for development):**
- Always passes: `1x00000000000000000000AA`
- Always fails: `2x00000000000000000000AB`
- Force interactive: `3x00000000000000000000FF`

Replace with your real site key before deploying to production!

## How It Works

1. User selects files
2. Turnstile widget appears and verifies the user
3. On success, the convert button is enabled
4. When converting, the Turnstile token is sent with the request
5. Backend verifies the token with Cloudflare before processing
6. If verification fails, request is rejected

## Security Notes

- The site key is public and shown in the HTML
- The secret key must be kept private (environment variable only)
- Tokens are single-use and expire after verification
- Each new conversion requires a new verification

## Disable Turnstile (Development)

To disable Turnstile for local development, simply don't set the `TURNSTILE_SECRET_KEY` environment variable. The backend will skip verification if the key is not configured.
