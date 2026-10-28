import { embedUrl, formatVideoDuration, parseYouTubeVideoId, searchUrl, thumbnailUrl } from './youtube';

describe('parseYouTubeVideoId()', () => {
  it('reads the id from every common YouTube link shape', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PL1')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('  https://www.youtube.com/live/dQw4w9WgXcQ  ')).toBe('dQw4w9WgXcQ');
  });

  it('rejects other sites, malformed ids and non-http schemes', () => {
    expect(parseYouTubeVideoId('https://evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(parseYouTubeVideoId('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=short')).toBeNull();
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ"><script>')).toBeNull();
    expect(parseYouTubeVideoId('javascript:alert(1)//youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(parseYouTubeVideoId('https://www.youtube.com/channel/UC1234567890')).toBeNull();
    expect(parseYouTubeVideoId('not a url')).toBeNull();
    expect(parseYouTubeVideoId('')).toBeNull();
  });
});

describe('YouTube URL builders', () => {
  it('builds privacy-enhanced embed, thumbnail and search URLs', () => {
    expect(embedUrl('dQw4w9WgXcQ')).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);
    expect(thumbnailUrl('dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg');
    expect(searchUrl('C# Loops tutorial')).toBe('https://www.youtube.com/results?search_query=C%23%20Loops%20tutorial');
  });

  it('formats durations like YouTube does', () => {
    expect(formatVideoDuration(754)).toBe('12:34');
    expect(formatVideoDuration(65)).toBe('1:05');
    expect(formatVideoDuration(3723)).toBe('1:02:03');
    expect(formatVideoDuration(null)).toBe('');
    expect(formatVideoDuration(0)).toBe('');
  });
});
