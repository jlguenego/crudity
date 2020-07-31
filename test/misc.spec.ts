import { getDeepValue, removeDeepValue, removeKeys } from "../src/misc";
import { strict as assert } from "assert";
import _ from "lodash";

describe("MISC", function () {
  it("should get deep value", async function () {
    const obj = { toto: 123, titi: ["qwer", { tutu: 345 }] };
    const result = getDeepValue(obj, ["titi", "1", "tutu"]);
    assert.equal(result, 345);
  });

  it("should remove deep value", async function () {
    const obj = { toto: 123, titi: ["qwer", { tutu: 345 }] };
    removeDeepValue(obj, ["titi", "1", "tutu"]);
    assert(_.isEqual(obj, { toto: 123, titi: ["qwer"] }));
  });

  it("should remove key from array", async function () {
    const array = ["toto", "titi", "tata"];
    removeKeys(array, "1");
    assert(_.isEqual(array, ["toto", "tata"]));
  });
});
