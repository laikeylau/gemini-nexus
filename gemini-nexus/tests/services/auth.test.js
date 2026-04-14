import { afterEach, describe, expect, test, vi } from 'vitest';
import { fetchRequestParams, parseRequestParamsFromHtml } from '../../services/auth.js';

describe('auth service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.fetch;
  });

  test('parses auth params and discovered account index from Gemini html', () => {
    const params = parseRequestParamsFromHtml(
      `
        <html>
          <body data-index="3">
            <script>
              window.__DATA__ = {"SNlM0e":"at-token","cfb2h":"bl-token"};
            </script>
          </body>
        </html>
      `,
      '0'
    );

    expect(params).toEqual({
      atValue: 'at-token',
      blValue: 'bl-token',
      authUserIndex: '3',
    });
  });

  test('fetches account-specific auth params from the requested Gemini account url', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(
        '<div data-index="7">{"SNlM0e":"token-7","cfb2h":"build-7"}</div>'
      ),
    });

    await expect(fetchRequestParams('7')).resolves.toEqual({
      atValue: 'token-7',
      blValue: 'build-7',
      authUserIndex: '7',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://gemini.google.com/u/7/app',
      { method: 'GET' }
    );
  });

  test('throws a login error when the Gemini html does not contain auth tokens', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue('<html><body>Sign in</body></html>'),
    });

    await expect(fetchRequestParams('0')).rejects.toThrow(
      'Not logged in for account 0. Please log in to gemini.google.com.'
    );
  });
});
