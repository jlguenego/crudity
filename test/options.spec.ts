import { strict as assert } from "assert";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";

import { Article } from "../misc/Article";
import { Server } from "../misc/Server";
import { timer } from "rxjs";

const port = 3000;
const filename = path.resolve(__dirname, "../data/test.json");

describe("Options", function () {
  it("should minify the json datafile", async function () {
    try {
      try {
        fs.unlinkSync(filename);
      } catch (e) {}
      await timer(100).toPromise();
      const server = new Server<Article>({ port, filename, minify: true });
      await server.start();
      const article: Article = {
        name: "Tournevis",
        price: 2.99,
        qty: 100,
      };
      const response = await fetch(`http://localhost:${port}/ws/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      assert.equal(response.status, 201);
      await server.stop();
      await timer(100).toPromise();
      const str = fs.readFileSync(filename, { encoding: "utf8" });
      assert.equal(
        str,
        `[{"name":"Tournevis","price":2.99,"qty":100,"id":"1"}]`
      );
    } catch (e) {
      assert.fail(e);
    }
  });
});
