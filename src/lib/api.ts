export const api = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Ensure we don't double up on /api if the path already starts with it
  const apiPath = normalized.startsWith("/api/") ? normalized : `/api${normalized}`;
  return `${window.location.origin}${apiPath}`;
};

export const safeFetch = async (url: string, options?: RequestInit) => {
  console.log("FETCH START:", url);
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    console.log("FETCH RESPONSE:", {
      url,
      status: res.status,
      statusText: res.statusText,
      body: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
    });
    
    // Return a new Response object because text() was already consumed
    return new Response(text, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (err) {
    console.error("FETCH ERROR:", url, err);
    throw err;
  }
};
