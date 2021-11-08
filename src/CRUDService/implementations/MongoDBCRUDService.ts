import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {CRUDService} from '../CRUDService';

export class MongoDBCRUDService<T extends Idable> extends CRUDService<T> {
  add(item: T): Promise<T> {
    throw new Error('not implemented.');
  }

  get(query: CrudityQueryString, pageSize: number): Promise<Partial<T>[]> {
    throw new Error('not implemented.');
  }

  getOne(id: string): Promise<T | undefined> {
    throw new Error('not implemented.');
  }

  patch(id: string, body: Partial<T>): Promise<T> {
    throw new Error('not implemented.');
  }

  remove(ids: string[]): Promise<void> {
    throw new Error('not implemented.');
  }

  removeAll(): Promise<void> {
    throw new Error('not implemented.');
  }

  rewrite(arg0: T): Promise<T> {
    throw new Error('not implemented.');
  }

  async start(): Promise<void> {}

  async stop(): Promise<void> {}
}
