import {CrudityQueryString} from '../interfaces/CrudityQueryString';
import {Idable} from '../interfaces/Idable';

export abstract class CRUDService<T extends Idable> {
  abstract add(item: T): Promise<T>;
  abstract get(query: CrudityQueryString, pageSize: number): Promise<T[]>;
  abstract getOne(id: string): Promise<T>;
  abstract patch(id: string, body: Partial<T>): Promise<T>;
  abstract remove(ids: string[]): Promise<void>;
  abstract removeAll(): Promise<void>;
  abstract rewrite(arg0: T): Promise<T>;
}
