import { sendToBackground } from '../../shared/messaging/index.js';
import { createPrefixedId, getHighResImageUrl } from '../../shared/utils/index.js';
import { t } from '../core/i18n.js';

export function createGeneratedImage(imgData) {
    const img = document.createElement('img');
    img.className = 'generated-image loading';
    img.alt = imgData.alt || t('generatedImage');

    // Loading Placeholder (Transparent 1x1 SVG)
    img.src =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg==';

    const reqId = createPrefixedId('gen_img');
    img.dataset.reqId = reqId;

    // Upgrade to HD (Original Size) using shared utility
    const targetUrl = getHighResImageUrl(imgData.url);

    // Request Background Fetch (Proxy) to handle CORS/Cookies and get Base64
    sendToBackground({
        action: 'FETCH_GENERATED_IMAGE',
        url: targetUrl,
        reqId: reqId,
    });

    // Click to view full size (works once the src is populated with base64)
    img.addEventListener('click', () => {
        if (img.src && !img.src.startsWith('data:image/svg')) {
            document.dispatchEvent(new CustomEvent('gemini-view-image', { detail: img.src }));
        }
    });

    return img;
}
