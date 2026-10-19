export type LoadState<T> =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: T };

export function describe<T>(state: LoadState<T>): string {
  switch (state.kind) {
    case 'idle': return 'Nothing loaded yet';
    case 'loading': return 'Loading…';
    case 'error': return `Failed: ${state.message}`;
    case 'ready': return 'Loaded';
    default: {
      const exhaustive: never = state;   // compile error if a case is missing
      return exhaustive;
    }
  }
}
