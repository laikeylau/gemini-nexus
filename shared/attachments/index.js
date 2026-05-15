const MIME_EXTENSIONS = {
    'application/pdf': 'pdf',
    'application/json': 'json',
    'text/css': 'css',
    'text/csv': 'csv',
    'text/html': 'html',
    'text/javascript': 'js',
    'text/markdown': 'md',
    'text/plain': 'txt',
    'text/x-python': 'py',
};

function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

export function getDataUrlMime(dataUrl) {
    if (typeof dataUrl !== 'string') return null;
    return dataUrl.match(/^data:([^;,]+)[;,]/)?.[1] || null;
}

function getDefaultExtension(mimeType) {
    if (!mimeType) return 'bin';
    if (mimeType.startsWith('image/')) return mimeType.split('/')[1] || 'png';
    return MIME_EXTENSIONS[mimeType] || 'bin';
}

function createDefaultName(index, mimeType) {
    return `attachment-${index + 1}.${getDefaultExtension(mimeType)}`;
}

export function normalizeUserAttachments(attachments) {
    const items = Array.isArray(attachments) ? attachments : attachments ? [attachments] : [];

    return items
        .map((item, index) => {
            if (typeof item === 'string') {
                const type = getDataUrlMime(item) || 'image/png';
                return {
                    base64: item,
                    type,
                    name: createDefaultName(index, type),
                };
            }

            if (!isPlainObject(item) || typeof item.base64 !== 'string') return null;

            const type = item.type || getDataUrlMime(item.base64) || 'application/octet-stream';
            return {
                base64: item.base64,
                type,
                name:
                    typeof item.name === 'string' && item.name.trim()
                        ? item.name
                        : createDefaultName(index, type),
            };
        })
        .filter(Boolean);
}

export function getImageAttachmentDataUrls(attachments) {
    return normalizeUserAttachments(attachments)
        .filter((attachment) => attachment.type.startsWith('image/'))
        .map((attachment) => attachment.base64);
}

export function getAttachmentDataUrls(attachments) {
    return normalizeUserAttachments(attachments).map((attachment) => attachment.base64);
}

export function countUserAttachmentsByType(attachments) {
    return normalizeUserAttachments(attachments).reduce(
        (counts, attachment) => {
            if (attachment.type.startsWith('image/')) {
                counts.images += 1;
            } else {
                counts.files += 1;
            }
            return counts;
        },
        { images: 0, files: 0 }
    );
}

export function attachmentToInlineData(attachment) {
    const [metadata, data] = String(attachment?.base64 || '').split(',');
    if (!metadata || !data) return null;

    return {
        mimeType:
            attachment.type || getDataUrlMime(attachment.base64) || 'application/octet-stream',
        data,
    };
}
