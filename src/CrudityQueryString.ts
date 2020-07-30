import { CrudityFilterObject } from "./CrudityFilter";

export interface CrudityQueryString {
  page?: number;
  pageSize?: number;
  filter?: CrudityFilterObject;
  orderBy?: string;
}
