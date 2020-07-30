import express from "express";
import serveIndex from "serve-index";
import { Crudity } from "..";
import http from "http";

export class Server<T> {
  server: http.Server;
  app: express.Express;
  crudity: Crudity<T>;
  constructor(private port, private filename: string, private minify = false) {
    const app = express();
    const www = ".";

    app.use(express.json());

    this.crudity = new Crudity<T>({
      filename: this.filename,
      debounceTimeDelay: 0,
      minify,
    });

    app.use("/ws/articles", this.crudity.router);

    app.use(express.static(www));
    app.use(serveIndex(www, { icons: true }));
    this.app = app;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      let isStarted = false;
      this.server = this.app.listen(this.port, () => {
        isStarted = true;
        resolve();
      });
      this.server.on("error", (e: NodeJS.ErrnoException) => {
        if (isStarted) {
          return;
        }
        this.server.close();
        reject(e);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async getArray(): Promise<T[]> {
    return this.crudity.resource.array$.value;
  }
}
