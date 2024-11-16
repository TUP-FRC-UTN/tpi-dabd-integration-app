export interface PaginatedResponse<T> {
  items: T[];
  totalElements: number;
}
