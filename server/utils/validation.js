/**
 * MindWell Validation Utilities
 * Focus: Privacy and Data Integrity
 */

// 1. Convert text to a URL-friendly format (Slugify)
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return "";
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};

// 2. Advanced Sanitization (XSS Prevention & Length Check)
export const sanitizeEntry = (text) => {
  if (!text || typeof text !== 'string') {
    return { isValid: false, cleaned: "" };
  }

  // Basic XSS protection: Remove HTML tags like <script>
  const noHtml = text.replace(/<[^>]*>?/gm, '');

  // Remove leading/trailing whitespace
  const trimmed = noHtml.trim();

  // Limit character count (5000 chars) for privacy and performance
  const limited = trimmed.slice(0, 5000);

  return {
    isValid: limited.length > 0,
    cleaned: limited
  };
};

// 3. String Manipulation: Convert comma-separated tags into a clean Array
export const parseTags = (tagString) => {
  if (!tagString || typeof tagString !== 'string') return [];
  
  return tagString
    .split(',')                  // Split by comma
    .map(tag => tag.trim())      // Remove extra spaces
    .filter(tag => tag !== '')   // Remove empty strings
    .map(tag => tag.toLowerCase()); // Keep it uniform for searching
};