const SESSION_CACHE_BUST = Date.now();

export const withCacheBuster = (url?: string | null) => {
  if (!url) return url;
  if (url.includes('?')) return url;
  return `${url}?v=${SESSION_CACHE_BUST}`;
};
