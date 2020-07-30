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

async function add(nbr = 10) {
  const article: Article = {
    name: "Screwdriver",
    price: 2.99,
    qty: 100,
  };
  const articles = new Array(nbr).fill(article);
  const response = await fetch(`http://localhost:${port}/ws/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(articles),
  });
  assert.equal(response.status, 201);
}

describe("Retrieve", function () {
  before(async () => {
    try {
      await server.start();
      await server.reset();
      await add(100);
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
