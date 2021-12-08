import {MongoClientOptions} from 'mongodb';
import {HateoasMode} from './HateoasMode';

export interface CrudityOptions {
  /**
   * Size for pagination.
   *
   * @default 15
   */
  pageSize: number;
  /**
   * Storage options object (file storage or mongodb storage)
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

export type StorageOptions = (FileStorageOptions | MongoDBStorageOptions) & {
  /**
   * Storage type (ex: file, mongodb, etc.).
   *
   * @default 'file'
   */
  type: string;
};

export interface FileStorageOptions {
  type: 'file';
  /**
   * Directory where to store the file. The filename will be <resourcename>.json.
   */
  dataDir: string;
}

export interface MongoDBStorageOptions {
  type: 'mongodb';

  /**
   * MongoDB URI connection string.
   */
  uri: string;

  /**
   * MongoClientOptions. See the MongoClient NodeJS drivers options.
   */
  opts?: MongoClientOptions;
}

export interface AsyncValidator {
  name: string;
  args: string[];
}
