import fetch from "node-fetch";
import assert from "assert";
import _ from "lodash";

import { Server } from "../misc/Server";
import { Article } from "../example/article.dto";

const port = 3000;
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

  it("should retrieve with default pagination", async function () {
    try {
      const response = await fetch(
        `http://localhost:${port}/ws/articles?page=2`
      );
      const actualArticles: Article[] = await response.json();
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, pageSize);
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 4);
      const expectedArticles = [
        { name: "Screwdriver 8", price: 0.05, qty: 32, id: "1000000000008" },
        { name: "Screwdriver 9", price: 0.8, qty: 36, id: "1000000000009" },
        {
          name: "Screwdriver 10",
          price: 0.7,
          qty: 40,
          provider: { name: "Grocery 10", zipcode: "F-2780" },
          id: "1000000000010",
        },
        { name: "Screwdriver 11", price: 0.6, qty: 44, id: "1000000000011" },
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 4);
      const expectedArticles = [
        { name: "Screwdriver 26", price: 0.8, qty: 104, id: "1000000000026" },
        { name: "Screwdriver 43", price: 0.8, qty: 172, id: "1000000000043" },
        {
          name: "Screwdriver 60",
          price: 0.8,
          qty: 240,
          provider: { name: "Grocery 60", zipcode: "F-6680" },
          id: "1000000000060",
        },
        { name: "Screwdriver 77", price: 0.8, qty: 308, id: "1000000000077" },
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 1);
      const expectedArticles = [
        { name: "Screwdriver 22", price: 0.35, qty: 88, id: "1000000000022" },
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 1);
      const expectedArticles = [
        { name: "Screwdriver 33", price: 0.1, qty: 132, id: "1000000000033" },
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 1);
      const expectedArticles = [
        { name: "Screwdriver 24", price: 0.15, qty: 96, id: "1000000000024" },
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 3);
      const expectedArticles = [
        {
          name: "Screwdriver 5",
          price: 0.35,
          qty: 20,
          provider: { name: "Grocery 5", zipcode: "F-6390" },
          id: "1000000000005",
        },
        {
          name: "Screwdriver 50",
          price: 0.1,
          qty: 200,
          provider: { name: "Grocery 50", zipcode: "F-3900" },
          id: "1000000000050",
        },
        {
          name: "Screwdriver 55",
          price: 0.45,
          qty: 220,
          provider: { name: "Grocery 55", zipcode: "F-290" },
          id: "1000000000055",
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
      assert.strictEqual(response.status, 400);
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 1);
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(actualArticles.length, 2);
      const expectedArticles = [
        { name: "Screwdriver 0", price: 0, id: "1000000000000" },
        { name: "Screwdriver 1", price: 0.75, id: "1000000000001" },
      ];
      assert(_.isEqual(actualArticles, expectedArticles));
    } catch (e) {
      assert.fail(e);
    }
  });
});
