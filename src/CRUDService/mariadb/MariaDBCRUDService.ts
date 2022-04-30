import { createPool, Pool, PoolConnection } from "mariadb";
import { MariaDBStorageOptions } from "../../interfaces/CrudityOptions";
import { CrudityQueryString } from "../../interfaces/CrudityQueryString";
import { Idable } from "../../interfaces/Idable";
import { PaginatedResult } from "../../interfaces/PaginatedResult";
import { CRUDService } from "../CRUDService";
import {
  getAllColNames,
  getColNames,
  getColValues,
  getIdColName,
  getIdColValue,
  getSetClause,
  getWhereClause,
  parseRows,
} from "./utils";

export class MariaDBCRUDService<T extends Idable> extends CRUDService<T> {
  pool!: Pool;
  conn!: PoolConnection;
  tableName = this.options.mapping?.tableName || this.resourceName;

  constructor(resourceName: string, public options: MariaDBStorageOptions) {
    super(resourceName);
  }

  async add(item: T): Promise<T> {
    const colNames = getColNames(this.options, item);
    if (item.id) {
      colNames.unshift(getIdColName(this.options));
    }
    const colNameStr = colNames.join(", ");
    const questionMarkStr = colNames.map(() => "?").join(", ");
    const colValues = getColValues(this.options, item);
    if (item.id) {
      colValues.unshift(getIdColValue(this.options, item));
    }

    const request = `insert into ${this.tableName} (${colNameStr}) values (${questionMarkStr})`;
    const conn = await this.getDbConnection();
    await conn.query(request, colValues);
    return item;
  }

  async addMany(newItems: T[]): Promise<T[]> {
    if (newItems.length === 0) {
      return [];
    }
    const colNames = getColNames(this.options, newItems[0]);
    const colNameStr = colNames.join(", ");
    const questionMarkStr = colNames.map(() => "?").join(", ");

    const request = `INSERT INTO \`${this.tableName}\` (${colNameStr}) VALUES (${questionMarkStr})`;
    const values = newItems.map((item) => getColValues(this.options, item));

    const conn = await this.getDbConnection();
    await conn.beginTransaction();
    try {
      await conn.batch(request, values);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
    }

    return [];
  }

  async get(
    query: CrudityQueryString,
    defaultPageSize = 10
  ): Promise<PaginatedResult<T>> {
    const cols = getAllColNames(this.options).join(", ");

    const whereClause = getWhereClause(this.options, query);

    const conn = await this.getDbConnection();
    const request = `select ${cols} from ${this.tableName} ${whereClause};`;
    const result = await conn.query(request);
    const items = parseRows(this.options, result);

    const paginatedResult = {
      array: items,
      page: 1,
      pageSize: 1e6,
      length: 0,
    };
    return paginatedResult;
  }

  async getOne(id: string): Promise<T | undefined> {
    const cols = getAllColNames(this.options).join(", ");
    const idColName = getIdColName(this.options);
    const idValue = id;

    const request = `select ${cols} from ${this.tableName} WHERE ${idColName} = ${idValue};`;

    const conn = await this.getDbConnection();
    const result = await conn.query(request);
    const items: T[] = parseRows(this.options, result);
    return items[0];
  }

  async patch(id: string, body: Partial<T>): Promise<T> {
    const idValue = id;
    const setClause = getSetClause(this.options, body);
    const idColName = getIdColName(this.options);

    const conn = await this.getDbConnection();
    const request = `update ${this.tableName} set ${setClause} WHERE ${idColName} = ${idValue};`;
    const result = await conn.query(request);
    const item = await this.getOne(id);
    if (!item) {
      throw new Error(
        "should not happen. but we cannot find the updated item."
      );
    }
    return item;
  }

  async remove(ids: string[]): Promise<void> {
    const idStr = getIdColName(this.options);
    const questionMarkStr = ids.map(() => "?").join(", ");
    const values = ids.map((id) => getIdColValue(this.options, { id }));
    const conn = await this.getDbConnection();
    const request = `DELETE FROM ${this.tableName} WHERE ${idStr} IN (${questionMarkStr})`;
    const result = await conn.query(request, values);
  }

  async removeAll(): Promise<void> {
    const conn = await this.getDbConnection();
    conn.query(`TRUNCATE TABLE \`${this.tableName}\``);
  }

  async rewrite(newT: T): Promise<T> {
    // remove and insert
    await this.remove([newT.id]);
    return await this.add(newT);
  }

  async start(): Promise<void> {
    this.pool = createPool(this.options.config);

    await this.createDatabaseIfNeeded();
    await this.createTableIfNeeded();
  }

  async stop(): Promise<void> {
    await this.pool?.end();
  }

  async getDbConnection(): Promise<PoolConnection> {
    try {
      await this.conn.query(`USE \`${this.options.database}\`;`);
      return this.conn;
    } catch (err) {
      this.conn = await this.pool.getConnection();
      await this.conn.query(`USE \`${this.options.database}\`;`);
      return this.conn;
    }
  }

  async createDatabaseIfNeeded(): Promise<void> {
    const conn = await this.pool.getConnection();
    const request = `CREATE DATABASE IF NOT EXISTS \`${this.options.database}\`;`;
    await conn.query(request);
  }

  async createTableIfNeeded(): Promise<void> {
    const conn = await this.getDbConnection();
    const request = `SHOW TABLES LIKE '${this.tableName}';`;
    const result = await conn.query(request);
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
  }
}
