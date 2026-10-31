type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseJson<T>(text: string): Result<T> {
  return { ok: true, value: JSON.parse(text) };
}
