import express from "express";
import serveIndex from "serve-index";
import fetch from "node-fetch";
import path from "path";
import http from "http";
import { strict as assert } from "assert";

import { Crudity } from "..";
import { CrudityOptions } from "../src/CrudityOptions";

interface ServerOptions extends CrudityOptions {
  port?: number;
}

export class Server<T> {
  options = {
    port: 3000,
    minify: false,
    filename: path.resolve(__dirname, "../data/test.json"),
    debounceTimeDelay: 0,
  };
  server: http.Server;
  app: express.Express;
  crudity: Crudity<T>;
  constructor(options: ServerOptions) {
    Object.assign(this.options, options);
    const app = express();
    const www = ".";

    app.use(express.json());

    this.crudity = new Crudity<T>(this.options);

    app.use("/ws/articles", this.crudity.router);

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

  async getArray(): Promise<T[]> {
    return this.crudity.resource.array$.value;
  }

  async reset() {
    await fetch(`http://localhost:${this.options.port}/ws/articles`, {
      method: "DELETE",
    });
  }

  async add(t: T | T[]) {
    const response = await fetch(`http://localhost:${this.options.port}/ws/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
    });
    assert.equal(response.status, 201);
  }
}
