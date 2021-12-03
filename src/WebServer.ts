import express, {Express} from 'express';
import {createServer, Server} from 'http';
import morgan from 'morgan';
import path from 'path';
import serveIndex from 'serve-index';
import {crudity} from './crudity.router';
import {WebServerOptions} from './interfaces/WebServerOptions';
import cors from 'cors';

export class WebServer {
  options: WebServerOptions = {
    port: 3000,
    cors: true,
    publicDir: './public',
    resources: {
      articles: {
        pageSize: 10,
        delay: 500,
      },
    },
    rootEndPoint: '/api',
  };
  app: Express;
  server: Server;
  constructor(options: Partial<WebServerOptions> = {}) {
    const crudityConfigFile = path.resolve(process.cwd(), './crudity');
    let crudityOpts = {};
    try {
      crudityOpts = require(crudityConfigFile);
    } catch (err) {
      console.log(
        `No crudity conf detected. It should be "${crudityConfigFile}.json".`
      );
    }
    Object.assign(this.options, crudityOpts, options);
    console.log(
      `Using the following options: \n${JSON.stringify(
        this.options,
        undefined,
        2
      )}`
    );
    const app = express();
    this.server = createServer(app);

    if (this.options.cors) {
      app.use(cors());
    }
    app.use(morgan('tiny'));

    const rootEndPoint =
      this.options.rootEndPoint === '/' ? '' : this.options.rootEndPoint;

    for (const resource of Object.keys(this.options.resources)) {
      console.log('rootEndPoint: ', rootEndPoint);
      app.use(
        rootEndPoint + '/' + resource,
        crudity(this.server, resource, this.options.resources[resource])
      );
    }
    app.get(this.options.rootEndPoint, (req, res) => {
      const resources: {[resourceName: string]: string} = {};
      for (const resource of Object.keys(this.options.resources)) {
        const url =
          req.protocol +
          '://' +
          req.get('host') +
          rootEndPoint +
          '/' +
          resource;
        resources[resource] = url;
      }
      res.json(resources);
    });

    app.use(express.static(this.options.publicDir));
    app.use(serveIndex(this.options.publicDir));
    this.app = app;
  }

  start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.options.port, () => {
        console.log(`Server started on port ${this.options.port}`);
        this.server.off('error', reject);
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
