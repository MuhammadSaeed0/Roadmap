import { computed, signal } from '@angular/core';
import { ApiError } from './api-error';

/**
 * Tiny async-state helper built on signals: every page that loads data has
 * loading, error and value states, so they live together here.
 *
 *   readonly data = createLoader(() => this.api.dashboard());
 *   // template: @if (data.loading()) ... @else if (data.error()) ... @else { data.value() }
 */
export function createLoader<T>(fetcher: () => Promise<T>, options: { immediate?: boolean } = {}) {
  const value = signal<T | undefined>(undefined);
  const error = signal<ApiError | null>(null);
  const loading = signal(false);
  let requestId = 0;

  async function reload(): Promise<void> {
    const id = ++requestId;
    loading.set(true);
    error.set(null);
    try {
      const result = await fetcher();
      if (id === requestId) value.set(result);   // ignore responses that arrive out of order
    } catch (e) {
      if (id === requestId) error.set(ApiError.from(e));
    } finally {
      if (id === requestId) loading.set(false);
    }
  }

  if (options.immediate !== false) void reload();

  return {
    value: value.asReadonly(),
    error: error.asReadonly(),
    loading: loading.asReadonly(),
    /** True only for the very first load (show skeletons); later reloads keep old data visible. */
    initialLoading: computed(() => loading() && value() === undefined),
    reload,
    /** Replace the value locally after a successful mutation, without refetching. */
    set: (v: T) => value.set(v),
    update: (fn: (v: T) => T) => {
      const current = value();
      if (current !== undefined) value.set(fn(current));
    },
  };
}

export type Loader<T> = ReturnType<typeof createLoader<T>>;
