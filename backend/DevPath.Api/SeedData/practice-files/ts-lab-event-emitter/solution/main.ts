type Handler<T> = (payload: T) => void;

class Emitter<Events extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof Events, Set<Handler<any>>>();

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  once<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    const wrapper: Handler<Events[K]> = payload => {
      this.off(event, wrapper);
      handler(payload);
    };
    return this.on(event, wrapper);
  }

  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    for (const handler of [...(this.handlers.get(event) ?? [])]) {
      try {
        handler(payload);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
