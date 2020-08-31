import fetch from "node-fetch";
import { strict as assert } from "assert";
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
const server = new Server<Article>({
  port,
  filename,
  pageSize,
  dtoClass: Article,
});

const getArticles = (nbr: number): Article[] =>
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
        {
          name: "Screwdriver 10",
          price: 0.7,
          qty: 40,
          provider: { name: "Grocery 10", zipcode: "F-2780" },
          id: "10",
        },
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
        {
          name: "Screwdriver 60",
          price: 0.8,
          qty: 240,
          provider: { name: "Grocery 60", zipcode: "F-6680" },
          id: "60",
        },
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
      const expectedArticles = [
        { name: "Screwdriver 22", price: 0.35, qty: 88, id: "22" },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve with name filtered with regexp", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?filter[name]=/ 33/`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 1);
      const expectedArticles = [
        { name: "Screwdriver 33", price: 0.1, qty: 132, id: "33" },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve with name filtered with regexp ignorecase", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?filter[name]=/SCREW.*24/i`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 1);
      const expectedArticles = [
        { name: "Screwdriver 24", price: 0.15, qty: 96, id: "24" },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve with provider name filtered with regexp", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?filter[provider][name]=/ERY 5/i`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 3);
      const expectedArticles = [
        {
          name: "Screwdriver 5",
          price: 0.35,
          qty: 20,
          provider: { name: "Grocery 5", zipcode: "F-6390" },
          id: "5",
        },
        {
          name: "Screwdriver 50",
          price: 0.1,
          qty: 200,
          provider: { name: "Grocery 50", zipcode: "F-3900" },
          id: "50",
        },
        {
          name: "Screwdriver 55",
          price: 0.45,
          qty: 220,
          provider: { name: "Grocery 55", zipcode: "F-290" },
          id: "55",
        },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should throw an error because bad filter syntax", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?filter=toto`
      );
      assert.equal(response.status, 400);
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve with select on name and price, and a none existing field", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?filter[name]=/33/&select=name,price,toto`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 1);
      const expectedArticles = [{ name: "Screwdriver 33", price: 0.1 }];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });

  it("should retrieve with unselect on qty, and a none existing field", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?pageSize=2&unselect=qty,toto,provider`
      );
      const actualArticles: Article[] = await response.json();
      assert.equal(response.status, 200);
      assert.equal(actualArticles.length, 2);
      const expectedArticles = [
        { name: "Screwdriver 0", price: 0, id: "0" },
        { name: "Screwdriver 1", price: 0.75, id: "1" },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });
});
