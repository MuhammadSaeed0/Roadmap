const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function retry<T>(work: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  if (attempts < 1) throw new Error("attempts must be at least 1");
  let last: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await work();
    } catch (e) {
      last = e;
      if (i < attempts) await wait(delayMs);
    }
  }
  throw last;
}
