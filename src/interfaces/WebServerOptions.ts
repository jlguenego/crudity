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
   * @default {
      articles: {
        pageSize: 10,
        delay: 500,
      },
    }
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
