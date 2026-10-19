export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return map;
}

function sortBy<T>(items: T[], prop: keyof T): T[] {
  return [...items].sort((a, b) => (a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0));
}

// Angular: this.http.get<PagedResult<ProductDto>>('/api/products')
