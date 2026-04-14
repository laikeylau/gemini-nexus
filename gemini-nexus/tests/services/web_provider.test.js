import { afterEach, describe, expect, test, vi } from 'vitest';

const {
  fetchRequestParams,
  uploadFile,
  parseGeminiLine,
} = vi.hoisted(() => ({
  fetchRequestParams: vi.fn(),
  uploadFile: vi.fn(),
  parseGeminiLine: vi.fn(),
}));

vi.mock('../../services/auth.js', () => ({
  fetchRequestParams,
}));

vi.mock('../../services/upload.js', () => ({
  uploadFile,
}));

vi.mock('../../services/parser.js', () => ({
  parseGeminiLine,
}));

import { isGeminiLoginHtml, sendWebMessage } from '../../services/providers/web.js';

function createStream(...chunks) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe('web provider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    fetchRequestParams.mockReset();
    uploadFile.mockReset();
    parseGeminiLine.mockReset();
    delete globalThis.fetch;
  });

  test('detects login html markers in the first response chunk', () => {
    expect(isGeminiLoginHtml('<!DOCTYPE html><html>Sign in</html>')).toBe(true);
    expect(isGeminiLoginHtml(')]}\'\n[["wrb.fr",null,"payload"]]')).toBe(false);
  });

  test('streams parsed Gemini updates and returns the updated context', async () => {
    parseGeminiLine.mockReturnValueOnce(null).mockReturnValueOnce({
      text: 'Answer',
      thoughts: 'Thinking',
      images: [{ url: 'https://example.com/image.png', alt: 'Generated Image' }],
      ids: ['conversation', 'response', 'choice'],
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createStream('ignored\n', 'payload-line\n'),
    });

    const onUpdate = vi.fn();
    const context = {
      atValue: 'token',
      blValue: 'build-label',
      authUser: '0',
      contextIds: ['', '', ''],
    };

    const result = await sendWebMessage(
      'Hello',
      context,
      'gemini-3-flash',
      [],
      undefined,
      onUpdate
    );

    expect(result).toEqual({
      text: 'Answer',
      thoughts: 'Thinking',
      images: [{ url: 'https://example.com/image.png', alt: 'Generated Image' }],
      newContext: {
        atValue: 'token',
        blValue: 'build-label',
        authUser: '0',
        contextIds: ['conversation', 'response', 'choice'],
      },
    });
    expect(onUpdate).toHaveBeenCalledWith('Answer', 'Thinking');
  });

  test('throws a session-expired error when Gemini returns login html', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createStream('<!DOCTYPE html><html>Sign in</html>'),
    });

    await expect(
      sendWebMessage(
        'Hello',
        {
          atValue: 'token',
          blValue: 'build-label',
          authUser: '0',
          contextIds: ['', '', ''],
        },
        'gemini-3-flash',
        [],
        undefined,
        vi.fn()
      )
    ).rejects.toThrow('未登录 (Session expired)');
  });

  test('surfaces non-ok network responses with the HTTP status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    await expect(
      sendWebMessage(
        'Hello',
        {
          atValue: 'token',
          blValue: 'build-label',
          authUser: '0',
          contextIds: ['', '', ''],
        },
        'gemini-3-flash',
        [],
        undefined,
        vi.fn()
      )
    ).rejects.toThrow('Network Error: 429 Too Many Requests');
  });
});
