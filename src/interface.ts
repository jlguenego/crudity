import { Resource } from "./Resource";
import { Validator } from "./Validator";

/**
 * Utilities for giving class name as input parameter inside a function.
 *
 * @export
 * @interface TypeClass
 * @template T
 */
export interface TypeClass<T> {
  new (): T;
}

export interface Idable {
  id: string;
}

/**
 * Options for JsonResource
 *
 * @export
 * @interface CrudityJsonOptions
 */
export interface CrudityJsonOptions {
  type: "json";
  filename: string;
  minify: boolean;
  debounceTimeDelay: number;
}

/**
 * options for the crudity router.
 *
 * @export
 * @interface CrudityOptions
 * @template T
 */
export interface CrudityOptions<T> {
  resource: Resource<T>;
  pageSize: number;
  validator: Validator<T>;
}

/**
 * In the query string, the filter parameter is a string or an object.
 *
 * @export
 * @interface CrudityFilterObject
 */
export interface CrudityFilterObject {
  [key: string]: string | CrudityFilterObject;
}

/**
 * The query string format.
 *
 * @export
 * @interface CrudityQueryString
 */
export interface CrudityQueryString {
  page?: number;
  pageSize?: number;
  filter?: CrudityFilterObject;
  orderBy?: string;
  select?: string;
  unselect?: string;
}
