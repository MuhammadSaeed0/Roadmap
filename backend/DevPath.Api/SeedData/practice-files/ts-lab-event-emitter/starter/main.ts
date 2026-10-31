class Emitter<Events extends Record<string, unknown>> {
  on(event: string, handler: (payload: any) => void): () => void {
    throw new Error("TODO");
  }
}
