const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/* Load tokens from localStorage */
export function getStoredTokens() {
  return {
    access_token: localStorage.getItem("spotify_token"),
    refresh_token: localStorage.getItem("spotify_refresh")
  };
}

/* Save tokens */
export function storeTokens(access, refresh) {
  if (access) localStorage.setItem("spotify_token", access);
  if (refresh) localStorage.setItem("spotify_refresh", refresh);
}

/* Automatically refresh the user's Spotify access token */
export async function refreshAccessToken() {
  const { refresh_token } = getStoredTokens();
  if (!refresh_token) {
    console.warn("No refresh token found — user must re-login.");
    return null;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token })
    });

    const data = await res.json();

    if (data.access_token) {
      storeTokens(data.access_token, data.refresh_token);
      return data.access_token;
    }

    console.error("Failed to refresh token:", data);
    return null;

  } catch (err) {
    console.error("Refresh error:", err);
    return null;
  }
}

/* Spotify API wrapper — ALWAYS refreshes token if expired */
export async function spotifyFetch(url, options = {}) {
  let { access_token } = getStoredTokens();

  async function doFetch(token) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Attempt request with existing access token:
  let response = await doFetch(access_token);

  // If unauthorized → refresh and retry:
  if (response.status === 401) {
    console.log("Access token expired — refreshing…");

    const newToken = await refreshAccessToken();
    if (!newToken) return response;

    response = await doFetch(newToken);
  }

  return response;
}
