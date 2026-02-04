import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty) => {
    return {
        __html: DOMPurify.sanitize(dirty)
    };
};
