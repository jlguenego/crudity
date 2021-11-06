import {CrudityOptions} from './CrudityOptions';
export interface WebServerOptions {
  port: number;
  publicDir: string;
  resources: string[];
  rootEndPoint: string;
  crudity: CrudityOptions;
}
