import { Resource } from "./resource/Resource";

export interface Idable {
  id: string;
}

export interface CrudityJsonOptions {
  type: "json";
  filename: string;
  minify: boolean;
  debounceTimeDelay: number;
}

export interface CrudityMongoDBOptions {
  type: "mongodb";
  url: string;
}

export interface SequelizeOptions {
  type: "sequelize";
  sequelize: string;
}

export interface CrudityOptions<T> {
  resource: Resource<T>;
  pageSize: number;
  dtoClass?: new () => T;
}

export type CrudityFilter = string | CrudityFilterObject;

export interface CrudityFilterObject {
  [key: string]: CrudityFilterObject | string;
}

export interface CrudityQueryString {
  page?: number;
  pageSize?: number;
  filter?: CrudityFilterObject;
  orderBy?: string;
  select?: string;
  unselect?: string;
}
