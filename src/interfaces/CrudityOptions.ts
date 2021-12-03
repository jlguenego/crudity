import {MongoClientOptions} from 'mongodb';

export interface CrudityOptions {
  pageSize: number;
  storage: StorageOptions;
  delay: number;
}

export type StorageOptions = FileStorageOptions | MongoDBStorageOptions;

export interface FileStorageOptions {
  type: 'file';
  dataDir: string;
}

export interface MongoDBStorageOptions {
  type: 'mongodb';
  uri: string;
  opts?: MongoClientOptions;
}
