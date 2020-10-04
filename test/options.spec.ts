import assert from "assert";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";

import { Server } from "../misc/Server";
import { timer } from "rxjs";
import { Article } from "../example/article.dto";
import { JsonResource } from "../src/json/JsonResource";

const port = 3000;
const filename = path.resolve(__dirname, "../data/test.json");

describe("Options", function () {
  it("should minify the json datafile", async function () {
    try {
      try {
        fs.unlinkSync(filename);
      } catch (e) {}
      await timer(100).toPromise();
      const server = new Server({
        port,
        resource: new JsonResource<Article>({
          filename,
          minify: true,
          debounceTimeDelay: 0,
        }),
      });
      await server.start();
      const article: Partial<Article> = {
        name: "Tournevis",
        price: 2.99,
        qty: 100,
      };
      const response = await fetch(`http://localhost:${port}/ws/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      assert.strictEqual(response.status, 201);
      await server.stop();
      await timer(100).toPromise();
      const str = fs.readFileSync(filename, { encoding: "utf8" });
      assert.strictEqual(
        str,
        `[{"name":"Tournevis","price":2.99,"qty":100,"id":"0"}]`
      );
    } catch (e) {
      assert.fail(e);
    }
  });
});
