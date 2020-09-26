import { CrudityQueryString } from "../interface";

export abstract class Resource<T> {
  abstract add(t: T): T;
  abstract rewrite(t: T): T;
  abstract patch(id: string, body: any): T;
  abstract remove(ids: string[]): void;
  abstract removeAll(): void;
  abstract get(
    query: CrudityQueryString,
    defaultPageSize?: number
  ): Partial<T>[];
  abstract getOne(id: string): T;
}
