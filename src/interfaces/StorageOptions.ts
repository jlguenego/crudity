export type StorageOptions = FileStorageOptions | MongoDBStorageOptions;

export interface FileStorageOptions {
  type: 'file';
  dataDir: string;
}

export interface MongoDBStorageOptions {
  type: 'mongodb';
  uri: string;
}
