type LoadState<T> =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: T };

function render(state: LoadState<string[]>): string {
  switch (state.kind) {
    case 'loading': return 'Loading…';
    case 'error':   return `Error: ${state.message}`;       // message exists here
    case 'ready':   return `${state.data.length} items`;    // data exists here
    default: {
      const unreachable: never = state;                     // compile error if a case is missing
      return unreachable;
    }
  }
}

function label(value: string | number | null): string {
  if (value === null) return '—';
  if (typeof value === 'number') return value.toFixed(2);
  return value.trim();
}
