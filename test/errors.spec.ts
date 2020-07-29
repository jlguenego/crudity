import { strict as assert } from "assert";
import path from "path";
import fs from "fs";

import { Server } from "../misc/Server";
import { Article } from "../misc/Article";
import { timer } from "rxjs";

const port = 3000;
const filename = path.resolve(__dirname, "../data/data.json");

describe("Error Management", function () {
  it("should says that filename is not set", async function () {
    try {
      const server = new Server<Article>(port, undefined);
      await server.start();
      assert.fail("server should not start");
    } catch (e) {
      assert(e instanceof Error);
      assert.equal(e.message, "CrudityOptions.filename is not set.");
    }
  });

  it("should throw an error if server is started on same port", async function () {
    try {
      const server1 = new Server<Article>(port, filename);
      await server1.start();
      try {
        const server2 = new Server<Article>(port, filename);
        await server2.start();
        assert.fail("server2 should not start");
      } catch (e) {
        assert(e instanceof Error);
        assert.equal(
          e.message,
          `listen EADDRINUSE: address already in use :::${port}`
        );
      }
      await server1.stop();
    } catch (error) {}
  });

  it("should continue to run even if an socket error is emitted", async function () {
    try {
      const server = new Server<Article>(port, filename);
      await server.start();
      server.server.emit("error", { test: "fake error" });
      await timer(10).toPromise();
      await server.stop();
    } catch (error) {
      assert.fail(error);
    }
  });

  it("should throw an error while closing", async function () {
    try {
      const server = new Server<Article>(port, filename);
      await server.start();
      await server.stop();
      await server.stop();
      assert.fail("you should not go here");
    } catch (error) {
      assert(error instanceof Error);
      assert.equal(
        (error as NodeJS.ErrnoException).code,
        "ERR_SERVER_NOT_RUNNING"
      );
    }
  });

  it("start with a new data.json file", async function () {
    try {
      fs.unlinkSync(filename);
      const server = new Server<Article>(
        port,
        filename
      );
      await server.start();
      await server.stop();
      const articles = await server.getArray();
      assert.equal(articles.length, 0);
    } catch (error) {
      assert.fail(error);
    }
  });
});
