import assert from "assert";
import fs from "fs";
import got from "got";
import { WebServer } from "../src/WebServer";
import { oneHundredArticles, a1, a2 } from "./fixtures/articles";
import { port, webServerConfig } from "./fixtures/crudity-config";
import { Article } from "./misc/Article";

describe("Server", () => {
  const url = `http://localhost:${port}/api/articles`;
  const webServer = new WebServer(webServerConfig);
  before(async () => {
    await webServer.start();
  });

  after(async () => {
    await webServer.stop();
  });

  const testStorage = process.env.TEST_STORAGE ?? "file";

  it(`should test with ${testStorage}`, () => {});

  it("should read test.txt", async () => {
    const text = await got.get(`http://localhost:${port}/test.txt`).text();
    const content = await fs.promises.readFile("./public/test.txt", {
      encoding: "utf-8",
    });
    assert.deepStrictEqual(text, content);
  });

  it("should delete all articles", async () => {
    await got.delete(url);
    const articles = await got.get(url).json<Article[]>();
    assert.deepStrictEqual(articles, []);
  });

  it("should add 100 articles in bulk", async function () {
    this.timeout(15000);
    const response = await got.post(url, {
      body: JSON.stringify(oneHundredArticles),
      headers: {
        "Content-Type": "application/json",
      },
    });
    assert.deepStrictEqual(response.statusCode, 201);
    const articles = await got
      .get(`http://localhost:${port}/api/articles?pageSize=0`)
      .json<Article[]>();
    assert.deepStrictEqual(articles.length, 100);
  });

  it("should add 1 article", async () => {
    const newArticles = await got
      .post(url, {
        body: JSON.stringify(a1),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .json<Article>();
    assert.deepStrictEqual(newArticles.price, a1.price);
    const articles = await got
      .get(`http://localhost:${port}/api/articles?pageSize=200`)
      .json<Article[]>();
    assert.deepStrictEqual(articles.length, 101);
  });

  it("should patch 1 article", async () => {
    const articles = await got
      .get(`http://localhost:${port}/api/articles?filter[name]=${a1.name}`)
      .json<Article[]>();
    const article = articles[0];
    assert.deepStrictEqual(article.price, a1.price);
    const newPrice = 34.56;
    const patchedArticle = await got
      .patch(`http://localhost:${port}/api/articles/${article.id}`, {
        body: JSON.stringify({ price: newPrice }),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .json<Article>();
    assert.deepStrictEqual(patchedArticle.price, newPrice);
  });

  it("should rewrite 1 article", async function () {
    this.timeout(10000);
    const articles = await got
      .get(`http://localhost:${port}/api/articles?filter[name]=${a1.name}`)
      .json<Article[]>();
    const article = articles[0];
    assert.deepStrictEqual(article.name, a1.name);
    const rewroteArticle = await got
      .put(`http://localhost:${port}/api/articles/${article.id}`, {
        body: JSON.stringify(a2),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .json<Article>();
    assert.deepStrictEqual(rewroteArticle.name, a2.name);
  });

  it("should not add duplicate articles", async () => {
    await got.delete(url);
    const articles = await got.get(url).json<Article[]>();
    assert.deepStrictEqual(articles, []);

    await got.post(url, {
      body: JSON.stringify(a1),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await got.post(url, {
      body: JSON.stringify(a1),
      headers: {
        "Content-Type": "application/json",
      },
      throwHttpErrors: false,
    });
    assert.deepStrictEqual(response.statusCode, 400);
    assert.deepStrictEqual(response.body, "duplicate name : " + a1.name);
  });
});
