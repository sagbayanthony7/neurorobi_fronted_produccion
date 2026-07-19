/**
 * Returns the correct image src from a profileImageUrl.
 * Handles both base64 data URIs (new) and file paths like /uploads/... (legacy).
 */
export function imageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:')) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
}
