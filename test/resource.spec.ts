import assert from "assert";

import { Article } from "../example/article.dto";
import { JsonResource } from "../src/resource/JsonResource";

describe("Resource", function () {
  it("should not rewrite because no id", async function () {
    try {
      const article: Partial<Article> = {
        name: "Tournevis",
        price: 2.99,
        qty: 100,
      };
      const resource = new JsonResource<Article>({ type: "json" });
      resource.rewrite(article as Article);
      assert.fail("should not reach this");
    } catch (e) {
      assert(e instanceof Error);
      assert.strictEqual(e.message, "no id");
    }
  });
});
