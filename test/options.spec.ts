import { strict as assert } from "assert";

import { Server } from "../misc/Server";
import { Article } from "../misc/Article";

const port = 3000;

describe("Options", function () {
  it("should says that filename is not set", async function () {
    try {
      const server = new Server<Article>(port, undefined);
      await server.start();
      assert.fail("server should not start");
    } catch (e) {
      assert(e instanceof Error);
      assert.equal(e.message, "CrudityOptions.filename is not set.");
    }
  });
});
