/**
 * Task 6: UI Presentation Logic
 * Connecting to Task 2 (Slugs) and Task 3 (Tags)
 */

// 1. Transform raw titles into "Pretty" display text
export const formatTitleForUI = (title) => {
  if (!title) return "";
  // Capitalize first letter of every word
  return title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// 2. Transform raw Tag Arrays (from Task 3) into Visual Chips
export const formatTagsForUI = (tagsArray) => {
  if (!tagsArray || !Array.isArray(tagsArray)) return [];
  // Ensure they are lowercase and have a hashtag prefix for the UI
  return tagsArray.map(tag => `#${tag.toLowerCase()}`);
};

/**
 * Task 8: API Response Formatter
 * Capitalizes the first letter of messages for a professional UI
 */
export const formatApiResponse = (message) => {
  if (!message) return "";
  return message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
};