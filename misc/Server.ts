import express from "express";
import serveIndex from "serve-index";
import fetch from "node-fetch";
import path from "path";
import http from "http";
import assert from "assert";

import { crudity, CrudityOptions, CrudityRouter } from "../src";

interface ServerOptions<T> extends CrudityOptions<T> {
  port?: number;
}

export class Server<T> {
  options: ServerOptions<T> = {
    port: 3000,
    resource: {
      type: "json",
      filename: path.resolve(__dirname, "../data/test.json"),
      minify: false,
      debounceTimeDelay: 0,
    },
  };
  server: http.Server;
  app: express.Express;
  articleRouter: CrudityRouter<T>;
  constructor(options: ServerOptions<T>) {
    Object.assign(this.options, options);
    const app = express();
    const www = ".";

    app.use(express.json());
    this.articleRouter = crudity<T>(this.options);
    app.use("/ws/articles", this.articleRouter);

    app.use(express.static(www));
    app.use(serveIndex(www, { icons: true }));
    this.app = app;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      let isStarted = false;
      this.server = this.app.listen(this.options.port, () => {
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

  getArray(): Promise<T[]> {
    return Promise.resolve(this.articleRouter.resource.get({}, 10000) as T[]);
  }

  async reset(): Promise<void> {
    await fetch(`http://localhost:${this.options.port}/ws/articles`, {
      method: "DELETE",
    });
  }

  async add(t: T | T[]): Promise<void> {
    const response = await fetch(
      `http://localhost:${this.options.port}/ws/articles`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      }
    );
    assert.strictEqual(response.status, 201);
  }
}
