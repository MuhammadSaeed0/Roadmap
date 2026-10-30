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
  throw new Error("TODO");
}
