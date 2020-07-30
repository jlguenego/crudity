export type CrudityFilter = string | CrudityFilterObject;

export interface CrudityFilterObject {
  [key: string]: CrudityFilterObject | string;
}
