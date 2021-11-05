import {CrudityOptions} from './CrudityOptions';
export interface WebServerOptions extends CrudityOptions {
  port: number;
  publicDir: string;
}
