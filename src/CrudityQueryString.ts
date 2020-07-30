import { CrudityFilter } from "./CrudityFilter";

export interface CrudityQueryString {
  page?: number;
  pageSize?: number;
  filter?: CrudityFilter;
  orderBy?: string;
}
