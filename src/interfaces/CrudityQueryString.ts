export interface CrudityQueryString {
  page: number;
  pageSize: number;
  filter: CrudityFilterObject;
  orderBy: string;
  select: string;
  unselect: string;
}

export interface CrudityFilterObject {
  [key: string]: string | CrudityFilterObject;
}
