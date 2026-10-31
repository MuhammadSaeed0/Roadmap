async function retry<T>(work: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  return work();
}
