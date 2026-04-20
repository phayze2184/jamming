const clientId = 'f1940c49d4984375900d72087ef555e2';
const redirectUri = 'http://127.0.0.1:3000/';
const scope = 'playlist-modify-public playlist-modify-private';
const accountsBaseUrl = 'https://accounts.spotify.com';
const apiBaseUrl = 'https://api.spotify.com/v1';
const maxPlaylistItemsPerRequest = 100;

// Centralize localStorage keys so auth state is managed consistently.
const storageKeys = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  tokenExpiry: 'spotify_token_expiry',
  codeVerifier: 'spotify_code_verifier',
  authState: 'spotify_auth_state',
};

function readStorage(key) { return localStorage.getItem(key); }
function writeStorage(key, value) { localStorage.setItem(key, value); }
function removeStorage(key) { localStorage.removeItem(key); }
function clearAuthRequestState() { removeStorage(storageKeys.codeVerifier); removeStorage(storageKeys.authState); }
function clearAccessToken() { removeStorage(storageKeys.accessToken); removeStorage(storageKeys.tokenExpiry); }
// Remove Spotify callback query params after we have handled them.
function clearAuthErrorFromUrl() { window.history.replaceState({}, document.title, window.location.pathname); }

function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, value) => acc + possible[value % possible.length], '');
}

// PKCE uses a verifier/challenge pair instead of exposing a client secret in the browser.
function generateCodeVerifier() { return generateRandomString(64); }

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function apiFetch(url, options = {}) {
  // Normalize Spotify/API errors so the UI can show one readable message.
  const response = await fetch(url, options);
  const body = await parseResponseBody(response);
  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.error_description ||
      body?.message ||
      (typeof body === 'string' && body) ||
      `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return body;
}

function storeTokenData(data, fallbackRefreshToken = '') {
  // Store both the token value and its absolute expiry time for quick reuse later.
  writeStorage(storageKeys.accessToken, data.access_token);
  const expiresIn = data.expires_in ?? 3600;
  writeStorage(storageKeys.tokenExpiry, String(Date.now() + expiresIn * 1000));
  if (data.refresh_token) {
    writeStorage(storageKeys.refreshToken, data.refresh_token);
  } else if (fallbackRefreshToken) {
    writeStorage(storageKeys.refreshToken, fallbackRefreshToken);
  }
}

async function refreshAccessToken(refreshToken) {
  // If we already have a refresh token, avoid forcing the user through login again.
  const data = await apiFetch(`${accountsBaseUrl}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  });
  storeTokenData(data, refreshToken);
  return data.access_token;
}

// Shared promise prevents duplicate code exchanges when React calls auth code twice in dev.
let pendingTokenExchangePromise = null;

async function exchangeCodeForToken(code) {
  // Validate that the callback matches the login request we originally started.
  const verifier = readStorage(storageKeys.codeVerifier);
  const expectedState = readStorage(storageKeys.authState);
  const urlParams = new URLSearchParams(window.location.search);
  const returnedState = urlParams.get('state');
  if (!verifier) { throw new Error('Missing Spotify PKCE code verifier. Sign in again.'); }
  if (expectedState && returnedState !== expectedState) {
    clearAuthRequestState();
    throw new Error('Spotify authorization state mismatch. Sign in again.');
  }
  // Remove the callback params before any later auth checks run again.
  window.history.replaceState({}, '', '/');
  const data = await apiFetch(`${accountsBaseUrl}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier,
    }),
  });
  storeTokenData(data);
  clearAuthRequestState();
  return data.access_token;
}

async function redirectToSpotifyLogin() {
  // Generate and store the PKCE values needed to verify the callback later.
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateRandomString(16);
  writeStorage(storageKeys.codeVerifier, verifier);
  writeStorage(storageKeys.authState, state);
  const authUrl = new URL(`${accountsBaseUrl}/authorize`);
  authUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: 'true',
  }).toString();
  window.location.href = authUrl.toString();
}

function getAuthHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function chunkItems(items, chunkSize) {
  // Spotify only accepts up to 100 playlist items per request.
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

const Spotify = {
  async getAccessToken() {
    // Reuse the same token exchange while the Spotify callback is being processed.
    if (pendingTokenExchangePromise) return pendingTokenExchangePromise;

    // Fast path: use the cached access token while it is still valid.
    const stored = readStorage(storageKeys.accessToken);
    const expiry = readStorage(storageKeys.tokenExpiry);
    if (stored && expiry && Date.now() < Number(expiry)) return stored;

    // Expired tokens are discarded so later requests cannot reuse them accidentally.
    localStorage.removeItem(storageKeys.accessToken);
    localStorage.removeItem(storageKeys.tokenExpiry);
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('error');
    const code = urlParams.get('code');
    const refreshToken = readStorage(storageKeys.refreshToken);

    // Spotify redirected back with an error instead of an auth code.
    if (authError) {
      clearAuthRequestState();
      clearAuthErrorFromUrl();
      throw new Error(`Spotify authorization failed: ${authError}`);
    }

    // Spotify redirected back with a one-time code that must be exchanged for tokens.
    if (code) {
      pendingTokenExchangePromise = exchangeCodeForToken(code)
        .finally(() => {
          pendingTokenExchangePromise = null;
        });
      return pendingTokenExchangePromise;
    }

    // No valid access token, but a refresh token may still recover the session.
    if (refreshToken) {
      try { return await refreshAccessToken(refreshToken); }
      catch { clearAccessToken(); removeStorage(storageKeys.refreshToken); }
    }

    // Last resort: start a fresh Spotify login flow.
    clearAccessToken();
    await redirectToSpotifyLogin();
    return '';
  },

  async search(term) {
    // Every API call goes through getAccessToken so auth is handled in one place.
    const token = await Spotify.getAccessToken();
    const data = await apiFetch(
      `${apiBaseUrl}/search?q=${encodeURIComponent(term)}&type=track`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Reduce Spotify's large response down to the fields the UI actually renders.
    return (data.tracks?.items ?? []).map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.[0]?.name ?? 'Unknown Artist',
      album: track.album.name,
      uri: track.uri,
    }));
  },

  async savePlaylist(playlistName, trackUris) {
    // Avoid hitting Spotify when the request is obviously incomplete.
    if (!playlistName || !trackUris.length) return;
    const token = await Spotify.getAccessToken();
    if (!token) return;
    const headers = getAuthHeaders(token);

    // First create the playlist on the current user's account.
    const { id: playlistId } = await apiFetch(`${apiBaseUrl}/me/playlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: playlistName }),
    });

    // Then add the selected track URIs, chunked to Spotify's request limit.
    const trackUriChunks = chunkItems(trackUris, maxPlaylistItemsPerRequest);
    for (const uris of trackUriChunks) {
      await apiFetch(`${apiBaseUrl}/playlists/${playlistId}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ uris }),
      });
    }
  },
};

export default Spotify;
