export interface PaginatedResponse<T> {
    content: T[];
    pageable: any;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    empty: boolean;
  }
  