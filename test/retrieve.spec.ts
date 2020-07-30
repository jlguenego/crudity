import fetch from "node-fetch";
import { strict as assert } from "assert";
import path from "path";
import fs from "fs";
import _ from "lodash";

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
    price: ((i * 100) % 17) / 20,
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

  it("should retrieve with custom page size", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?page=3&pageSize=4`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 4);
      const expectedArticles = [
        { name: "Screwdriver 8", price: 0.05, qty: 32, id: "8" },
        { name: "Screwdriver 9", price: 0.8, qty: 36, id: "9" },
        { name: "Screwdriver 10", price: 0.7, qty: 40, id: "10" },
        { name: "Screwdriver 11", price: 0.6, qty: 44, id: "11" },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve with name ordered", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?orderBy=-price,name&pageSize=4`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 4);
      const expectedArticles = [
        { name: "Screwdriver 26", price: 0.8, qty: 104, id: "26" },
        { name: "Screwdriver 43", price: 0.8, qty: 172, id: "43" },
        { name: "Screwdriver 60", price: 0.8, qty: 240, id: "60" },
        { name: "Screwdriver 77", price: 0.8, qty: 308, id: "77" },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });
  it("should retrieve with name filtered", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?filter[name]=Screwdriver 22`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 1);
      const expectedArticles = [{"name":"Screwdriver 22","price":0.35,"qty":88,"id":"22"}];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve with name filtered with regexp", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?filter[name]=/ 3/`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 1);
      const expectedArticles = [{"name":"Screwdriver 22","price":0.35,"qty":88,"id":"22"}];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });
});
