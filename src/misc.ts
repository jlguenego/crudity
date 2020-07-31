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

  const newFilterSpec = JSON.parse(JSON.stringify(filterSpec));

  const deepKeys = [keys[0]];

  while (true) {
    const value = getDeepValue(filterSpec, deepKeys);
    if (typeof value === "string") {
      removeDeepValue(newFilterSpec, deepKeys);
      break;
    }
    deepKeys.push(Object.keys(value)[0]);
  }
  const filterValue = getDeepValue(filterSpec, deepKeys);

  let checkFn: (v: string) => boolean = (v) => filterValue === v;
  if (filterValue.match(REGEXP)) {
    const spec = filterValue.replace(REGEXP, "$1");
    const flags = filterValue.replace(REGEXP, "$2");
    const regexp = new RegExp(spec, flags);
    checkFn = (v) => regexp.test(v);
  }
  return filter(
    array.filter((t) => {
      return checkFn(getDeepValue(t, deepKeys));
    }),
    newFilterSpec
  );
}

export function select<T>(array: T[], selectSpec: string): Partial<T>[] {
  const spec = selectSpec ?? "*";
  if (spec === "*") {
    return array;
  }
  const keys: (keyof T)[] = spec.split(",") as (keyof T)[];
  return array.map((t) => {
    const newT: Partial<T> = {};
    for (const key of keys) {
      if (key in t) {
        newT[key] = t[key];
      }
    }
    return newT;
  });
}

export function unselect<T>(
  array: Partial<T>[],
  unselectSpec: string
): Partial<T>[] {
  const spec = unselectSpec ?? "";
  if (spec === "") {
    return array;
  }
  const keys: (keyof T)[] = spec.split(",") as (keyof T)[];
  return array.map((t) => {
    const newT: Partial<T> = { ...t };
    for (const key of keys) {
      if (key in t) {
        delete newT[key];
      }
    }
    return newT;
  });
}

export function getDeepValue(t: any, keys: string[]): any {
  if (keys.length === 0 || t === undefined) {
    return t;
  }
  return getDeepValue(t[keys[0]], keys.slice(1));
}

export function removeDeepValue(t: any, keys: string[]): void {
  if (keys.length === 0 || t === undefined) {
    return;
  }
  const lastKey = keys[keys.length - 1];
  const previousKeys = keys.slice(0, -1);
  const child = getDeepValue(t, previousKeys);
  if (!child) {
    return;
  }
  removeKeys(child, lastKey);
  if (child !== t && Object.keys(child).length === 0) {
    removeDeepValue(t, previousKeys);
  }
}

export function removeKeys(t: any, key: string) {
  if (t instanceof Array) {
    const index = +key;
    if (isNaN(index)) {
      throw new Error("key must be an index number: " + key);
    }
    t.splice(index, 1);
    return t.filter((n, i) => i !== index);
  }
  if (t instanceof Object) {
    delete t[key];
  }
}
