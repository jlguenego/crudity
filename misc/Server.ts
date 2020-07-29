import express from "express";
import serveIndex from "serve-index";
import crudity from "..";
import http from "http";
import { promises as fs } from "fs";

export class Server<T> {
  server: http.Server;
  app: express.Express;
  constructor(private port, private filename: string) {
    const app = express();
    const www = ".";

    app.use(express.json());

    app.use(
      "/ws/articles",
      crudity<T>({ filename: this.filename, debounceTimeDelay: 0 })
    );

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
    const str = await fs.readFile(this.filename, { encoding: "utf8" });
    return JSON.parse(str);
  }
}
