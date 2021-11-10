import {MongoDBStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {CRUDService} from '../CRUDService';
import {MongoClient} from 'mongodb';

export class MongoDBCRUDService<T extends Idable> extends CRUDService<T> {
  client = new MongoClient(this.options.uri, this.options.opts);

  constructor(resourceName: string, public options: MongoDBStorageOptions) {
    super(resourceName);
  }

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
