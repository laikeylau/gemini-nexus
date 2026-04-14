
// services/auth.js
import { extractFromHTML } from '../lib/utils.js';

export function parseRequestParamsFromHtml(html, userIndex = '0') {
    const atValue = extractFromHTML('SNlM0e', html);
    const blValue = extractFromHTML('cfb2h', html);

    let authUserIndex = userIndex;
    const authMatch = html.match(/data-index="(\d+)"/);
    if (authMatch) {
        authUserIndex = authMatch[1];
    }

    if (!atValue) {
        throw new Error(`Not logged in for account ${userIndex}. Please log in to gemini.google.com.`);
    }

    return { atValue, blValue, authUserIndex };
}

// Get 'at' (SNlM0e), 'bl' (cfb2h), and user index values
// Supports fetching from specific user index URL to get correct tokens for that account.
export async function fetchRequestParams(userIndex = '0') {
    // Based on user feedback, account URLs differ slightly:
    // Default (0): https://gemini.google.com/app
    // Others (X): https://gemini.google.com/u/X/app
    let url = 'https://gemini.google.com/app';
    if (userIndex && userIndex !== '0') {
        url = `https://gemini.google.com/u/${userIndex}/app`;
    }

    console.log(`Fetching Gemini credentials for index ${userIndex} via ${url}...`);
    
    const resp = await fetch(url, {
        method: 'GET'
    });
    const html = await resp.text();

    return parseRequestParamsFromHtml(html, userIndex);
}
