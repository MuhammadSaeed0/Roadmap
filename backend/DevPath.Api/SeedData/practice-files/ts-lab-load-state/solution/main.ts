type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading'; requestId: number; previous: T | null }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string; previous: T | null };

type LoadEvent<T> =
  | { type: 'start'; requestId: number }
  | { type: 'success'; requestId: number; data: T }
  | { type: 'failure'; requestId: number; message: string };

function shown<T>(state: LoadState<T>): T | null {
  switch (state.status) {
    case 'ready': return state.data;
    case 'loading':
    case 'error': return state.previous;
    default: return null;
  }
}

function reduce<T>(state: LoadState<T>, event: LoadEvent<T>): LoadState<T> {
  if (event.type === 'start') return { status: 'loading', requestId: event.requestId, previous: shown(state) };
  // Ignore answers that are not for the request in flight (stale or duplicate).
  if (state.status !== 'loading' || state.requestId !== event.requestId) return state;
  return event.type === 'success'
    ? { status: 'ready', data: event.data }
    : { status: 'error', message: event.message, previous: state.previous };
}

function view<T>(state: LoadState<T>): string {
  switch (state.status) {
    case 'idle': return 'nothing';
    case 'ready': return 'list';
    case 'loading': return state.previous === null ? 'spinner' : 'list+spinner';
    case 'error': return state.previous === null ? 'error' : 'list+error';
  }
}
