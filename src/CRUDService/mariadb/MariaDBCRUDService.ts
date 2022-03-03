import {createPool, Pool} from 'mariadb';
import {MariaDBStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {PaginatedResult} from '../../interfaces/PaginatedResult';
import {CRUDService} from '../CRUDService';

export class MariaDBCRUDService<T extends Idable> extends CRUDService<T> {
  pool: Pool | undefined = undefined;

  constructor(resourceName: string, public options: MariaDBStorageOptions) {
    super(resourceName);
  }

  async add(item: T): Promise<T> {
    return item;
  }

  async addMany(newItems: T[]): Promise<T[]> {
    return newItems;
  }

  async get(
    query: CrudityQueryString,
    defaultPageSize = 10
  ): Promise<PaginatedResult<T>> {
    const pageSize =
      query.pageSize === undefined ? defaultPageSize : +query.pageSize;
    const pageNbr = query.page === undefined ? 1 : +query.page;

    const paginatedResult = {
      array: [],
      page: pageNbr,
      pageSize,
      length: 0,
    };
    return paginatedResult;
  }

  async getOne(id: string): Promise<T | undefined> {
    console.log('id: ', id);
    return undefined;
  }

  async patch(id: string, body: Partial<T>): Promise<T> {
    console.log('body: ', body);
    console.log('id: ', id);
    throw new Error('todo');
  }

  async remove(ids: string[]): Promise<void> {
    console.log('ids: ', ids);
    throw new Error('todo');
  }

  async removeAll(): Promise<void> {
    throw new Error('todo');
  }

  async rewrite(newT: T): Promise<T> {
    console.log('newT: ', newT);
    throw new Error('todo');
  }

  async start(): Promise<void> {
    this.pool = createPool(this.options.config);
  }

  async stop(): Promise<void> {
    if (this.pool === undefined) {
      return;
    }
    this.pool.end();
    this.pool = undefined;
  }
}
