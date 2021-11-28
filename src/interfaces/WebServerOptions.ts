import {CrudityOptions} from './CrudityOptions';
export interface WebServerOptions {
  port: number;
  cors: boolean;
  publicDir: string;
  resources: {
    [name: string]: Partial<CrudityOptions>;
  };
  rootEndPoint: string;
}
