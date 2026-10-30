interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  if (pageSize < 1) throw new Error("pageSize must be at least 1");
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page)), totalPages);
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current, pageSize, total, totalPages,
    hasNext: current < totalPages, hasPrevious: current > 1,
  };
}
