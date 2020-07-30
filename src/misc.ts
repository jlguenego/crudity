import _ from "lodash";

export function getPageSlice(pageSize: number, page: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { start, end };
}

export function orderBy<T>(array: T[], orderBySpec: string): T[] {
  if (!orderBySpec) {
    return array;
  }
  const fields = orderBySpec.split(",").map((s) => s.replace(/^[-+]/, ""));
  console.log("fields: ", fields);
  const ascArray = orderBySpec
    .split(",")
    .map((s) => (s.startsWith("-") ? "desc" : "asc"));
  console.log("ascArray: ", ascArray);
  return _.orderBy(array, fields, ascArray);
}
