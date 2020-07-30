import _ from "lodash";
import { CrudityFilterObject } from "./CrudityFilter";

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
  const ascArray = orderBySpec
    .split(",")
    .map((s) => (s.startsWith("-") ? "desc" : "asc"));
  return _.orderBy(array, fields, ascArray);
}

const REGEXP = /^\/(.*)\/(i?)$/;

export function filter<T>(array: T[], filterSpec: CrudityFilterObject): T[] {
  if (!filterSpec) {
    return array;
  }

  const keys = Object.keys(filterSpec);
  if (keys.length === 0) {
    return array;
  }

  const key = keys[0];
  const newFilterSpec = { ...filterSpec };
  delete newFilterSpec[key];

  const value = filterSpec[key] as string;
  const isRegexp = value.match(REGEXP);
  let checkFn: (t: T, key: string) => boolean = (t, k) => value === t[k];
  if (isRegexp) {
    const spec = value.replace(REGEXP, "$1");
    const flags = value.replace(REGEXP, "$2");
    const regexp = new RegExp(spec, flags);
    checkFn = (t, k) => regexp.test(t[k]);
  }
  return filter(
    array.filter((t) => {
      return checkFn(t, key);
    }),
    newFilterSpec
  );
}
