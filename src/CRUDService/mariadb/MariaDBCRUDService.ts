import {createPool, Pool, PoolConnection} from 'mariadb';
import {MariaDBStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {PaginatedResult} from '../../interfaces/PaginatedResult';
import {CRUDService} from '../CRUDService';

export class MariaDBCRUDService<T extends Idable> extends CRUDService<T> {
  pool: Pool | undefined = undefined;
  conn!: PoolConnection;
  tableName = this.options.mapping?.tableName || this.resourceName;

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
    console.log('query: ', query);
    console.log('defaultPageSize: ', defaultPageSize);

    const result = await this.conn.query('select * from events;');

    const paginatedResult = {
      array: result,
      page: 1,
      pageSize: 1e6,
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
    this.conn = await this.pool.getConnection();
    console.log('mariadb connection successful.');
    await this.checkTable();
  }

  async stop(): Promise<void> {
    await this.conn?.end();
    await this.pool?.end();
    this.pool = undefined;
  }

  async checkTable() {
    const request = `SHOW TABLES LIKE '${this.tableName}';`;
    console.log('request: ', request);
    const result = await this.conn.query(request);
    console.log('result: ', result);
    if (result.length > 0) {
      return;
    }
    if (!this.options.mapping?.tableCreationSQLRequest) {
      throw new Error(
        `Table ${this.tableName} does not exist and options.mapping.tableCreationSQLRequest is not defined. Cannot create table ${this.tableName}.`
      );
    }
    const tableCreatedResult = await this.conn.query(
      this.options.mapping?.tableCreationSQLRequest
    );
    console.log('tableCreatedResult: ', tableCreatedResult);
  }
}
