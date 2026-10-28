/**
 * YouTube URL helpers. Only video ids that match YouTube's 11-character format are ever
 * turned into URLs, so nothing a user types can end up in an iframe src as-is.
 * parseYouTubeVideoId is kept in sync with the topic-videos Edge Function.
 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export const isVideoId = (value: string): boolean => VIDEO_ID.test(value);

/** Accepts watch, youtu.be, shorts, embed and live URLs; returns null for anything else. */
export function parseYouTubeVideoId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.split('/')[1] ?? null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else id = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1] ?? null;
  }
  return id && isVideoId(id) ? id : null;
}

export const watchUrl = (videoId: string): string => `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

/** Privacy-enhanced embed: YouTube sets no cookies until the video plays. */
export const embedUrl = (videoId: string): string =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;

export const thumbnailUrl = (videoId: string): string => `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`;

export const searchUrl = (query: string): string => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

/** 754 -> "12:34", 3723 -> "1:02:03". */
export function formatVideoDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}
