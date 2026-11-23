interface ListState {
  q: string;
  categoryId: number | null;
  page: number;
  pageSize: number;
}

const DEFAULTS: ListState = { q: '', categoryId: null, page: 1, pageSize: 20 };
const PAGE_SIZES = [10, 20, 50];

function toQueryParams(state: ListState): Record<string, string> {
  const params: Record<string, string> = {};
  const q = state.q.trim();
  if (q) params['q'] = q;
  if (state.categoryId !== null) params['categoryId'] = String(state.categoryId);
  if (state.page !== DEFAULTS.page) params['page'] = String(state.page);
  if (state.pageSize !== DEFAULTS.pageSize) params['pageSize'] = String(state.pageSize);
  return params;
}

function positiveInt(text: string | undefined): number | null {
  if (text === undefined || !/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 ? n : null;
}

function fromQueryParams(params: Record<string, string | undefined>): ListState {
  const pageSize = positiveInt(params['pageSize']);
  return {
    q: (params['q'] ?? '').trim(),
    categoryId: positiveInt(params['categoryId']),
    page: positiveInt(params['page']) ?? DEFAULTS.page,
    pageSize: pageSize !== null && PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULTS.pageSize,
  };
}

function withSearch(state: ListState, q: string): ListState {
  return { ...state, q, page: 1 };
}
