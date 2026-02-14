const CORS_PROXY = "https://cors-proxy.espressif.tools";

/**
 * Checks if a URL needs CORS proxy based on its origin
 */
const needsCorsProxy = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const currentOrigin = window.location.origin;

    // Same origin doesn't need proxy
    if (urlObj.origin === currentOrigin) {
      return false;
    }

    // Local files don't need proxy
    if (urlObj.protocol === "file:") {
      return false;
    }

    // Different origin needs proxy
    return true;
  } catch {
    // If URL parsing fails, assume it's relative and doesn't need proxy
    return false;
  }
};

/**
 * Wraps fetch with CORS proxy support for cross-origin requests
 */
export const corsProxyFetch = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  if (needsCorsProxy(url)) {
    // Use proxy with correct query parameter format
    const proxiedUrl = `${CORS_PROXY}/?url=${encodeURIComponent(url)}`;
    // Don't forward potentially sensitive headers to the proxy
    const { headers, credentials, ...safeOptions } = options ?? {};
    return fetch(proxiedUrl, safeOptions);
  }

  return fetch(url, options);
};
