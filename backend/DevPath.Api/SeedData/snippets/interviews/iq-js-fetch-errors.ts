async function loadTopics(): Promise<Topic[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch('/api/topics', { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`); // 404/500 do not reject
    return (await response.json()) as Topic[];
  } finally {
    clearTimeout(timer);
  }
}
