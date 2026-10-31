type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseJson<T>(text: string): Result<T> {
  if (!text.trim()) return { ok: false, error: "The text is empty." };
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
