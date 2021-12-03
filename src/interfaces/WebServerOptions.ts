import {CrudityOptions} from './CrudityOptions';
export interface WebServerOptions {
  /**
   * Port that the crudity server listen to.
   *
   * @default 3000
   */
  port: number;
  /**
   * true to enable CORS
   *
   * @default true
   */
  cors: boolean;

  /**
   * Directory where to listen to
   *
   * @default './public'
   */
  publicDir: string;

  /**
   * Object that specifies all the resource names and their config.
   *
   */
  resources: {
    [name: string]: Partial<CrudityOptions>;
  };
  /**
   * The root endpoint for all ressources.
   *
   * @default '/api'
   */
  rootEndPoint: string;
}
