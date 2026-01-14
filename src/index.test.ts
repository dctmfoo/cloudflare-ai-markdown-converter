import { describe, it, expect, vi } from 'vitest';

describe('Markdown Conversion Worker', () => {
  it('should reject requests without files', async () => {
    const mockEnv = {
      AI: {
        toMarkdown: vi.fn(),
      },
    } as any;

    const formData = new FormData();
    const request = new Request('http://localhost/api/convert', {
      method: 'POST',
      body: formData,
    });

    const worker = await import('./index');
    const response = await worker.default.fetch(request, mockEnv);
    const data = await response.json() as any;

    expect(response.status).toBe(400);
    expect(data.error).toBe('No files provided');
  });

  it('should handle CORS preflight requests', async () => {
    const request = new Request('http://localhost/api/convert', {
      method: 'OPTIONS',
    });

    const worker = await import('./index');
    const response = await worker.default.fetch(request, {} as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should convert files successfully', async () => {
    const mockResult = {
      name: 'test.pdf',
      format: 'markdown',
      mimetype: 'application/pdf',
      tokens: 100,
      data: '# Test Document\n\nThis is a test.',
    };

    const mockEnv = {
      AI: {
        toMarkdown: vi.fn().mockResolvedValue([mockResult]),
      },
    } as any;

    const formData = new FormData();
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    formData.append('files', file);

    const request = new Request('http://localhost/api/convert', {
      method: 'POST',
      body: formData,
    });

    const worker = await import('./index');
    const response = await worker.default.fetch(request, mockEnv);
    const data = await response.json() as any;

    expect(response.status).toBe(200);
    expect(data).toEqual([mockResult]);
    expect(mockEnv.AI.toMarkdown).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test.pdf',
        }),
      ])
    );
  });

  it('should handle conversion errors', async () => {
    const mockEnv = {
      AI: {
        toMarkdown: vi.fn().mockRejectedValue(new Error('AI service unavailable')),
      },
    } as any;

    const formData = new FormData();
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    formData.append('files', file);

    const request = new Request('http://localhost/api/convert', {
      method: 'POST',
      body: formData,
    });

    const worker = await import('./index');
    const response = await worker.default.fetch(request, mockEnv);
    const data = await response.json() as any;

    expect(response.status).toBe(500);
    expect(data.error).toBe('AI service unavailable');
  });

  it('should return 404 for unknown routes', async () => {
    const request = new Request('http://localhost/unknown');
    const worker = await import('./index');
    const response = await worker.default.fetch(request, {} as any);

    expect(response.status).toBe(404);
  });
});
