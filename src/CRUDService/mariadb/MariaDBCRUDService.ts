import { connect } from "http2";
import { createPool, Pool, PoolConnection } from "mariadb";
import { MariaDBStorageOptions } from "../../interfaces/CrudityOptions";
import { CrudityQueryString } from "../../interfaces/CrudityQueryString";
import { Idable } from "../../interfaces/Idable";
import { PaginatedResult } from "../../interfaces/PaginatedResult";
import { CRUDService } from "../CRUDService";

export class MariaDBCRUDService<T extends Idable> extends CRUDService<T> {
  pool!: Pool;
  tableName = this.options.mapping?.tableName || this.resourceName;

  constructor(resourceName: string, public options: MariaDBStorageOptions) {
    super(resourceName);
  }

  async add(item: T): Promise<T> {
    const colNames =
      this.options.mapping?.columns?.map((c) => c.name) || Object.keys(item);
    const colValues = this.options.mapping?.columns
      ?.map((c) => {
        const val = (item as unknown as { [key: string]: unknown })[
          c.alias || c.name
        ];
        return c.type === "string" ? `'${val}'` : val;
      })
      .join(", ");

    const request = `insert into ${this.tableName} (${colNames}) values (${colValues})`;
    console.log("request: ", request);
    const conn = await this.getDbConnection();
    const result = await conn.query(request);
    console.log("result: ", result);
    return item;
  }

  async addMany(newItems: T[]): Promise<T[]> {
    const result: T[] = [];
    for (const item of newItems) {
      const newItem = await this.add(item);
      result.push(newItem);
    }
    return result;
  }

  async get(
    query: CrudityQueryString,
    defaultPageSize = 10
  ): Promise<PaginatedResult<T>> {
    console.log("query: ", query);
    console.log("defaultPageSize: ", defaultPageSize);

    const cols =
      this.options.mapping?.id.name +
      ", " +
      this.options.mapping?.columns
        ?.map((c) => `${c.name} as ${c.alias || c.name}`)
        .join(", ");

    const conn = await this.getDbConnection();
    const result = await conn.query(`select ${cols} from ${this.tableName};`);
    console.log("result: ", result);

    const paginatedResult = {
      array: result,
      page: 1,
      pageSize: 1e6,
      length: 0,
    };
    return paginatedResult;
  }

  async getOne(id: string): Promise<T | undefined> {
    console.log("id: ", id);
    return undefined;
  }

  async patch(id: string, body: Partial<T>): Promise<T> {
    console.log("body: ", body);
    console.log("id: ", id);
    throw new Error("todo");
  }

  async remove(ids: string[]): Promise<void> {
    console.log("ids: ", ids);
    throw new Error("todo");
  }

  async removeAll(): Promise<void> {
    throw new Error("todo");
  }

  async rewrite(newT: T): Promise<T> {
    console.log("newT: ", newT);
    throw new Error("todo");
  }

  async start(): Promise<void> {
    this.pool = createPool(this.options.config);
    console.log("mariadb connection successful.");
    await this.createDatabaseIfNeeded();
    await this.createTableIfNeeded();
  }

  async stop(): Promise<void> {
    await this.pool?.end();
  }

  async getDbConnection(): Promise<PoolConnection> {
    const conn = await this.pool.getConnection();
    const useResult = await conn.query(`USE \`${this.options.database}\`;`);
    console.log("useResult: ", useResult);
    return conn;
  }

  async createDatabaseIfNeeded(): Promise<void> {
    const conn = await this.pool.getConnection();
    const request = `CREATE DATABASE IF NOT EXISTS \`${this.options.database}\`;`;
    console.log("request: ", request);
    const result = await conn.query(request);
    console.log("result: ", result);
  }

  async createTableIfNeeded(): Promise<void> {
    const conn = await this.getDbConnection();
    const request = `SHOW TABLES LIKE '${this.tableName}';`;
    console.log("request: ", request);
    const result = await conn.query(request);
    console.log("result: ", result);
    if (result.length > 0) {
      return;
    }
    if (!this.options.mapping?.tableCreationSQLRequest) {
      throw new Error(
        `Table ${this.tableName} does not exist and options.mapping.tableCreationSQLRequest is not defined. Cannot create table ${this.tableName}.`
      );
    }
    const tableCreatedResult = await conn.query(
      this.options.mapping?.tableCreationSQLRequest
    );
    console.log("tableCreatedResult: ", tableCreatedResult);
  }
}
