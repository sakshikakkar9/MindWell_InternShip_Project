// server/utils/formatters.js
export const formatApiResponse = (message) => {
  if (!message) return "";
  // Example: Capitalize the first letter and trim whitespace
  return message.trim().charAt(0).toUpperCase() + message.trim().slice(1);
};