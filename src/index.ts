import { isExtensionAllowed, isMimeTypeAllowed, getValidationError } from './formats-config';

export interface Env {
  AI: {
    toMarkdown(files: MarkdownDocument | MarkdownDocument[]): Promise<ConversionResult | ConversionResult[]>;
  };
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  TURNSTILE_SECRET_KEY?: string;
}

export interface MarkdownDocument {
  name: string;
  blob: Blob;
}

export interface ConversionResult {
  name: string;
  format: 'markdown' | 'error';
  mimetype: string;
  tokens?: number;
  data?: string;
  error?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API endpoint for markdown conversion
    if (url.pathname === '/api/convert' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        
        // Verify Turnstile token if secret key is configured
        const turnstileToken = formData.get('cf-turnstile-response');
        if (env.TURNSTILE_SECRET_KEY && turnstileToken) {
          const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: env.TURNSTILE_SECRET_KEY,
              response: turnstileToken,
            }),
          });
          
          const turnstileResult = await turnstileVerify.json() as { success: boolean };
          if (!turnstileResult.success) {
            return new Response(
              JSON.stringify({ error: 'Verification failed. Please try again.' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        const files: MarkdownDocument[] = [];
        const validationErrors: string[] = [];

        for (const [, value] of formData.entries()) {
          if (value instanceof File) {
            // Validate file format
            const isExtensionValid = isExtensionAllowed(value.name);
            const isMimeValid = isMimeTypeAllowed(value.type);
            
            if (!isExtensionValid || !isMimeValid) {
              validationErrors.push(getValidationError(value.name, value.type));
              continue; // Skip this file
            }
            
            files.push({
              name: value.name,
              blob: value,
            });
          }
        }

        // Return validation errors if any files were rejected
        if (validationErrors.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid file format(s)',
              details: validationErrors 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (files.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No valid files provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const results = await env.AI.toMarkdown(files);
        
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Conversion failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Serve static assets from Pages
    return env.ASSETS.fetch(request);
  },
};
