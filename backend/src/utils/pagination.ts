export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const getPaginationParams = (
  page?: string | number,
  limit?: string | number,
): PaginationParams => {
  const pageNum = Math.max(1, Number(page) || DEFAULT_PAGE);

  const limitNum = Math.min(Math.max(1, Number(limit) || DEFAULT_LIMIT), MAX_LIMIT);

  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> => {
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
};
