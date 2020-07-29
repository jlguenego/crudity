import fetch from "node-fetch";
import { strict as assert } from "assert";
import path from "path";
import _ from "lodash";

import { Server } from "../misc/Server";
import { Article } from "../misc/Article";

const port = 3000;
const filename = path.resolve(__dirname, "../data/data.json");

const server = new Server<Article>(port, filename);

describe("CRUD", function () {
  before(async () => {
    try {
      await server.start();
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

  it("should delete all", async function () {
    try {
      const response = await fetch(`http://localhost:${port}/ws/articles`, {
        method: "DELETE",
      });
      assert.equal(response.status, 204);
      const articles = await server.getArray();
      assert.equal(articles.length, 0);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should add one", async function () {
    try {
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
      const articles = await server.getArray();
      assert.equal(articles.length, 1);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should get one", async function () {
    try {
      const response = await fetch(`http://localhost:${port}/ws/articles`);
      const actualArticles = await response.json();
      assert.equal(response.status, 200);
      const expectedArticles = await server.getArray();
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should remove one", async function () {
    try {
      const articles = await server.getArray();
      const id = articles[0].id;
      const response = await fetch(`http://localhost:${port}/ws/articles`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([id]),
      });
      assert.equal(response.status, 204);
      const articlesAfter = await server.getArray();
      articles.shift();
      assert(_.isEqual(articlesAfter, articles));
    } catch (e) {
      assert.fail(e);
    }
  });
});
