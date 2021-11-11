import express, {Express} from 'express';
import {createServer, Server} from 'http';
import path from 'path';
import serveIndex from 'serve-index';
import {crudity} from './crudity.router';
import {WebServerOptions} from './interfaces/WebServerOptions';

export class WebServer {
  options: WebServerOptions = {
    port: 3000,
    publicDir: './public',
    resources: {},
    rootEndPoint: '/api',
  };
  app: Express;
  server: Server;
  constructor(options: Partial<WebServerOptions> = {}) {
    const crudityOpts = require(path.resolve(process.cwd(), './.crudity'));
    Object.assign(this.options, crudityOpts, options);
    console.log('this.options: ', this.options);
    const app = express();
    this.server = createServer(app);

    app.use((req, res, next) => {
      console.log('req.url', req.url);
      next();
    });

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
      this.server.listen(this.options.port, () => {
        console.log(`Server started on port ${this.options.port}`);
        this.server.off('error', reject);
        resolve();
      });

      this.server.once('error', reject);
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
