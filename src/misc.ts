import { CrudityQueryString } from "./CrudityQueryString";

export const getPageSlice = (pageSize: number, page: number) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { start, end };
};
