import serveIndex from 'serve-index';
import {createServer, Server} from 'http';
import express, {Express} from 'express';

export interface WebServerOptions {
  port: number;
  publicDir: string;
}

export class WebServer {
  options = {
    port: 3000,
    publicDir: './public',
  };
  app: Express;
  server: Server;
  constructor(options: Partial<WebServerOptions> = {}) {
    Object.assign(this.options, options);
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
