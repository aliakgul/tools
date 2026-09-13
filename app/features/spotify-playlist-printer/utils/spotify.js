export function parsePlaylistId(input) {
  const value = input.trim();
  if (/^[a-zA-Z0-9]{22}$/.test(value)) return value;
  const uri = value.match(/^spotify:playlist:([a-zA-Z0-9]{22})$/);
  if (uri) return uri[1];
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "open.spotify.com" || url.username || url.password || url.port)
      return "";
    return url.pathname.match(/^\/(?:intl-[a-zA-Z-]+\/)?playlist\/([a-zA-Z0-9]{22})\/?$/)?.[1] || "";
  } catch {
    return "";
  }
}

export class SpotifyError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

// Construct every request locally: never send credentials to a response's next URL.
export async function fetchPlaylist({ input, token, signal, onProgress = () => {}, fetchImpl = fetch }) {
  const id = parsePlaylistId(input);
  if (!id) throw new SpotifyError("invalidPlaylist");
  const accessToken = token
    .trim()
    .replace(/^Bearer\s+/i, "")
    .trim();
  if (!accessToken) throw new SpotifyError("missingToken");
  const entries = [];
  let offset = 0;
  do {
    signal?.throwIfAborted();
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 30000);
    let data;
    try {
      const response = await fetchImpl(`https://api.spotify.com/v1/playlists/${id}/items?limit=50&offset=${offset}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (!response.ok) {
        throw new SpotifyError(
          { 401: "unauthorized", 403: "forbidden", 404: "notFound", 429: "rateLimited" }[response.status] ||
            "requestFailed",
        );
      }
      data = await response.json();
    } catch (error) {
      if (signal?.aborted) throw error;
      if (timedOut) throw new SpotifyError("timeout");
      if (error instanceof SpotifyError) throw error;
      throw new SpotifyError("network");
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
    signal?.throwIfAborted();
    if (!Array.isArray(data?.items)) throw new SpotifyError("requestFailed");
    for (const wrapper of data.items) {
      const item = wrapper && ("item" in wrapper ? wrapper.item : wrapper.track);
      entries.push(
        item?.name
          ? {
              name: item.name,
              artists: Array.isArray(item.artists)
                ? item.artists
                    .map((artist) => artist?.name)
                    .filter(Boolean)
                    .join(", ")
                : "",
            }
          : null,
      );
    }
    offset += data.items.length;
    onProgress(offset);
    if (!data.next) return { id, entries };
    if (!data.items.length) throw new SpotifyError("requestFailed");
  } while (true);
}
