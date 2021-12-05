import {Idable} from './Idable';
export interface PaginatedResult<T extends Idable> {
  array: Partial<T>[];
  length: number;
  page: number; // index starts at 1
  pageSize: number;
}
