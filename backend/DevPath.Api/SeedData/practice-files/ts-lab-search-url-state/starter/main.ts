// The state of a searchable, paged product list. It lives in signals and in the URL (?q=mouse&page=2...),
// so a page can be refreshed, bookmarked and shared.
interface ListState {
  q: string;          // default ''
  categoryId: number | null;   // default null
  page: number;       // default 1, never below 1
  pageSize: number;   // one of 10, 20, 50; default 20
}

const DEFAULTS: ListState = { q: '', categoryId: null, page: 1, pageSize: 20 };

// To query params: only the values that differ from the defaults, as strings; q is trimmed.
function toQueryParams(state: ListState): Record<string, string> {
  return {};
}

// From query params (anything can be typed in the URL): invalid or missing values fall back to the defaults.
function fromQueryParams(params: Record<string, string | undefined>): ListState {
  return DEFAULTS;
}

// A new search or filter starts again at page 1; changing only the page keeps the rest.
function withSearch(state: ListState, q: string): ListState {
  return { ...state, q };
}
