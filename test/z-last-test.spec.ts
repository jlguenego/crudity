import fetch from "node-fetch";
import assert from "assert";
import path from "path";
import fs from "fs";
import _ from "lodash";

import { Server } from "../misc/Server";
import { Article } from "../example/article.dto";

const port = 3000;
const filename = path.resolve(__dirname, "../data/test.json");
try {
  fs.unlinkSync(filename);
} catch (e) {}

const pageSize = 20;
const server = new Server({
  port,
  pageSize,
});

const generateArticles = (nbr: number): Article[] =>
  new Array(nbr)
    .fill(0)
    .map(
      (n, i) =>
        ({
          name: "Screwdriver " + i,
          price: ((i * 100) % 17) / 20,
          qty: i * 4,
        } as Article)
    )
    .map((n, i) => {
      if (n.qty % 10 === 0) {
        n.provider = {
          name: "Grocery " + i,
          zipcode: "F-" + ((i * 35278) % 10000),
        };
      }
      return n;
    });

describe("Retrieve", function () {
  before(async () => {
    try {
      await server.start();
      await server.reset();
      await server.add(generateArticles(100));
    } catch (e) {
      assert.fail(e);
    }
  });

  after(async () => {
    try {
      await server.stop();
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve 100 articles", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?pageSize=1000`
      );
      const actualArticles: Article[] = await response.json();
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 100);
    } catch (e) {
      assert.fail(e);
    }
  });
});
