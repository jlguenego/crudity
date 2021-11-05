import serveIndex from 'serve-index';
import {createServer, Server} from 'http';
import express, {Express} from 'express';
import path from 'path';

export interface WebServerOptions {
  port: number;
  publicDir: string;
  resources: string[];
  rootEndPoint: string;
}

export class WebServer {
  options: WebServerOptions = {
    port: 3000,
    publicDir: './public',
    resources: [],
    rootEndPoint: '/api',
  };
  app: Express;
  server: Server;
  constructor(options: Partial<WebServerOptions> = {}) {
    const crudityOpts = require(path.resolve(process.cwd(), './.crudity'));
    Object.assign(this.options, crudityOpts, options);
    const app = express();
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
