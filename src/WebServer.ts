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
    resources: ['articles', 'users'],
    rootEndPoint: '/api',
    crudity: {
      pageSize: 20,
      storage: {
        type: 'file',
        dataDir: './data',
      },
    },
  };
  app: Express;
  server: Server;
  constructor(options: Partial<WebServerOptions> = {}) {
    const crudityOpts = require(path.resolve(process.cwd(), './.crudity'));
    Object.assign(this.options, crudityOpts, options);
    const app = express();
    for (const resource of this.options.resources) {
      app.use(this.options.rootEndPoint + '/' + resource, crudity());
    }
    app.use(express.static(this.options.publicDir));
    app.use(serveIndex(this.options.publicDir));
    this.app = app;
    this.server = createServer(app);
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
