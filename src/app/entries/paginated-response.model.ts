export interface PaginatedResponse<T> {
  items: T[];
  total_elements: number;
}
