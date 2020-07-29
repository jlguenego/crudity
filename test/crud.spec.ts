import fetch from "node-fetch";
import { strict as assert } from "assert";
import path from "path";
import _ from "lodash";
import fs from "fs";

import { Server } from "../misc/Server";
import { Article } from "../misc/Article";

const port = 3000;
const filename = path.resolve(__dirname, "../data/test.json");
try {
  fs.unlinkSync(filename);
} catch (e) {}

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

  it("should add four", async function () {
    try {
      async function add() {
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
      }
      await add();
      await add();
      await add();
      await add();
      const articles = await server.getArray();
      assert.equal(articles.length, 4);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should add three in bulk", async function () {
    try {
      const newArticles: Article[] = [
        {
          name: "Saw",
          price: 2.99,
          qty: 100,
        },
        {
          name: "Pliers",
          price: 2.99,
          qty: 100,
        },
        {
          name: "Screwdriver",
          price: 2.99,
          qty: 100,
        },
      ];
      const response = await fetch(`http://localhost:${port}/ws/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticles),
      });
      assert.equal(response.status, 201);

      const articles = await server.getArray();
      assert.equal(articles.length, 7);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should get all", async function () {
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

  it("should get one", async function () {
    try {
      const articles = await server.getArray();
      const id = articles[0].id;
      const response = await fetch(
        `http://localhost:${port}/ws/articles/${id}`
      );
      assert.equal(response.status, 200);
      const article = await response.json();
      assert.equal(article.id, id);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should get 404", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles/not-exist`
      );
      assert.equal(response.status, 404);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should rewrite one", async function () {
    try {
      const articles = await server.getArray();
      const article = { ...articles[0] };
      const id = article.id;
      delete article.id;
      article.name = "Rewrited stuff";
      const response = await fetch(
        `http://localhost:${port}/ws/articles/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(article),
        }
      );
      assert.equal(response.status, 200);
      article.id = id;
      const rewroteArticle = await response.json();
      assert(_.isEqual(rewroteArticle, article));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should rewrite none", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles/not-existing`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      assert.equal(response.status, 404);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should patch one", async function () {
    try {
      const articles = await server.getArray();
      const id = articles[0].id;
      const diff = { name: "Patch stuff" };
      const response = await fetch(
        `http://localhost:${port}/ws/articles/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(diff),
        }
      );
      assert.equal(response.status, 200);
      const patchedArticle = await response.json();
      assert(_.isEqual(patchedArticle, { ...articles[0], ...diff }));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should remove only one", async function () {
    try {
      const articles = await server.getArray();
      const id = articles[0].id;
      const response = await fetch(
        `http://localhost:${port}/ws/articles/${id}`,
        { method: "DELETE" }
      );
      assert.equal(response.status, 204);
      const articlesAfter = await server.getArray();
      articles.shift();
      assert(_.isEqual(articlesAfter, articles));
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
});
