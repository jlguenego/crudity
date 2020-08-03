export interface CrudityOptions<T> {
  filename?: string;
  minify?: boolean;
  debounceTimeDelay?: number;
  pageSize?: number;
  dtoClass?: new () => T;
}
