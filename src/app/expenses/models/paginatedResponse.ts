export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
    };
    totalPages: number;
    totalElements: number;
  }

