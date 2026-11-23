// The state of a list that loads from an API. Previous data stays visible while refreshing.
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading'; requestId: number; previous: T | null }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string; previous: T | null };

type LoadEvent<T> =
  | { type: 'start'; requestId: number }
  | { type: 'success'; requestId: number; data: T }
  | { type: 'failure'; requestId: number; message: string };

// Rules:
// - start: go to loading and keep the data that was shown (ready.data, or the previous data of error/loading).
// - success/failure: only for the request that is currently loading; a late answer to an older request is ignored.
// - failure keeps the previous data so the screen can show it with an error message.
function reduce<T>(state: LoadState<T>, event: LoadEvent<T>): LoadState<T> {
  switch (event.type) {
    case 'start': return { status: 'loading', requestId: event.requestId, previous: null };
    case 'success': return { status: 'ready', data: event.data };
    case 'failure': return { status: 'error', message: event.message, previous: null };
  }
}

// What the screen shows: "spinner" (loading, nothing to show yet), "list", "list+spinner" (refreshing),
// "error", "list+error" (refresh failed, old data still visible) or "nothing" (idle).
function view<T>(state: LoadState<T>): string {
  return 'nothing';
}
