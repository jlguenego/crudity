import fetch from "node-fetch";
import { strict as assert } from "assert";
import path from "path";
import fs from "fs";

import { Server } from "../misc/Server";
import { Article } from "../misc/Article";

const port = 3000;
const filename = path.resolve(__dirname, "../data/test.json");
try {
  fs.unlinkSync(filename);
} catch (e) {}

const pageSize = 20;
const server = new Server<Article>({ port, filename, pageSize });

const getArticles = (nbr): Article[] =>
  new Array(100).fill(0).map((n, i) => ({
    name: "Screwdriver " + i,
    price: 2.08,
    qty: i * 4,
  }));

describe("Retrieve", function () {
  before(async () => {
    try {
      await server.start();
      await server.reset();
      await server.add(getArticles(100));
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

  it("should retrieve with default pagination", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?page=2`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, pageSize);
    } catch (e) {
      assert.fail(e);
    }
  });
});
