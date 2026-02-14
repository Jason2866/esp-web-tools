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
  // Clean the URL - remove whitespace and newlines
  url = url.trim();

  if (needsCorsProxy(url)) {
    // GitHub releases don't support CORS, use proxy directly
    if (url.includes("github.com") && url.includes("/releases/download/")) {
      const proxiedUrl = `${CORS_PROXY}/?url=${encodeURIComponent(url)}`;
      const { headers, credentials, ...safeOptions } = options ?? {};
      return fetch(proxiedUrl, safeOptions);
    }

    // Try direct fetch first for other cross-origin requests
    try {
      const response = await fetch(url, options);
      return response;
    } catch (directError) {
      // Direct fetch failed, try proxy
      try {
        const proxiedUrl = `${CORS_PROXY}/?url=${encodeURIComponent(url)}`;
        const { headers, credentials, ...safeOptions } = options ?? {};
        return await fetch(proxiedUrl, safeOptions);
      } catch (proxyError) {
        // Both failed, throw the original error
        throw directError;
      }
    }
  }

  return fetch(url, options);
};
