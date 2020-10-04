import { getDeepValue, removeDeepValue, removeKeys } from "../src/json/misc";
import assert from "assert";
import _ from "lodash";

describe("MISC", function () {
  it("should get deep value", async function () {
    const obj = { toto: 123, titi: ["qwer", { tutu: 345 }] };
    const result = getDeepValue(obj, ["titi", "1", "tutu"]);
    assert.strictEqual(result, 345);
  });

  it("should remove deep value", async function () {
    const obj = { toto: 123, titi: ["qwer", { tutu: 345 }] };
    removeDeepValue(obj, ["titi", "1", "tutu"]);
    assert(_.isEqual(obj, { toto: 123, titi: ["qwer"] }));
    const o2 = {};
    removeDeepValue(o2, ["titi", "1", "tutu"]);
    const o3: any = undefined;
    removeDeepValue(o3, ["titi", "1", "tutu"]);
    assert(_.isEqual(o3, undefined));
  });

  it("should remove key from array", async function () {
    const array = ["toto", "titi", "tata"];
    removeKeys(array, "1");
    assert(_.isEqual(array, ["toto", "tata"]));
  });

  it("should throw an error because an index must be a number", function () {
    try {
      const array = ["toto", "titi", "tata"];
      removeKeys(array, "aaa");
      assert.fail("should not reach this");
    } catch (e) {
      assert(e instanceof Error);
      assert.strictEqual(e.message, "key must be an index number: aaa");
    }
  });

  it("should remove a key", function () {
    const o = { titi: 123, toto: { tutu: 345 } };
    removeKeys(o, "toto");
    assert(_.isEqual(o, { titi: 123 }));
  });

  it("should do nothing", function () {
    const o = 123;
    removeKeys(o, "toto");
    assert(_.isEqual(o, 123));
  });
});
