/**
 * Helper to resolve media URLs by prepending the backend API's base URL
 * if they are relative paths.
 */
export function getMediaUrl(url) {
  if (!url) return null;
  
  // If it's already an absolute URL or base64 data, return as is
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  
  const apiBase = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  return `${cleanBase}${cleanUrl}`;
}
