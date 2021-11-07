import {CrudityOptions} from './CrudityOptions';
export interface WebServerOptions {
  port: number;
  publicDir: string;
  resources: {
    [name: string]: Partial<CrudityOptions>;
  };
  rootEndPoint: string;
}
