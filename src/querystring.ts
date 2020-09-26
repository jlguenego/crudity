import { CrudityQueryString } from "./interface";

export function checkQueryString(query: CrudityQueryString) {
  // TODO: make better function
  // suggeestion : transform to a class and validate.
  if (typeof query.filter === "string") {
    throw new Error(
      "filterSpec cannot be a string, but an object. Please read filter documentation."
    );
  }
}
