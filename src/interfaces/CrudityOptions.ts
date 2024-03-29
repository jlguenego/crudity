import { PoolConfig } from "mariadb";
import { MongoClientOptions } from "mongodb";
import { HateoasMode } from "./HateoasMode";

export interface CrudityOptions {
  /**
   * Singular name of the resource.
   */
  singularResourceName?: string;

  /**
   * Size for pagination.
   *
   * @default 20
   */
  pageSize: number;
  /**
   * Storage options object (file storage or mongodb storage, or mariadb storage)
   *
   */
  storage: StorageOptions;
  /**
   * milliseconds of time before sending back an HTTP response (for testing purpose).
   *
   * @default 0
   */
  delay: number;

  /**
   * Enable crudity logging.
   *
   * @default true
   */
  enableLogs: boolean;

  /**
   * Set Hateoas information in the body or in the header.
   *
   * @default "header"
   */
  hateoas: HateoasMode;

  validators: AsyncValidator[];
}

export type StorageOptions = (
  | FileStorageOptions
  | MongoDBStorageOptions
  | MariaDBStorageOptions
) & {
  /**
   * Storage type (ex: file, mongodb, mariadb, etc.).
   *
   * @default file
   */
  type: string;
};

export interface FileStorageOptions {
  type: "file";
  /**
   * Directory where to store the file. The filename will be <resourcename>.json.
   */
  dataDir: string;
}

export interface MongoDBStorageOptions {
  type: "mongodb";

  /**
   * MongoDB URI connection string.
   */
  uri: string;

  /**
   * MongoClientOptions. See the MongoClient NodeJS drivers options.
   */
  opts?: MongoClientOptions;
}

export interface MariaDBStorageOptions {
  type: "mariadb";

  /**
   * PoolConfig. See the MariaDB NodeJS drivers options.
   */
  config: PoolConfig;

  mapping?: MariaDBMapping;

  /**
   * Database to select. The database will be created if not already existing.
   */
  database: string;
}

export interface AsyncValidator {
  name: string;
  args: string[];
}

export interface MariaDBMapping {
  tableName?: string;
  tableCreationSQLRequest?: string;
  columns?: { name: string; type: "string" | "number"; alias?: string }[];
  id: { name: string; type: "string" | "number" };
}
