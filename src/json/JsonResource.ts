import path from "path";
import { BehaviorSubject, from } from "rxjs";
import { debounceTime, switchMap, distinct, skip } from "rxjs/operators";
import fs from "fs";

import { CrudityJsonOptions, CrudityQueryString, Idable } from "../interface";
import { Resource } from "../Resource";
import { filter, getPageSlice, orderBy, select, unselect } from "./misc";

const homedir = require('os').homedir();

export class JsonResource<T extends Idable> extends Resource<T> {
  array$ = new BehaviorSubject<T[]>([]);
  map: { [id: string]: T } = {};

  private nextId = 1;

  constructor(options?: Partial<CrudityJsonOptions>) {
    super();
    const opts: CrudityJsonOptions = {
      type: "json",
      filename: path.resolve(homedir, "crudity.json"),
      debounceTimeDelay: 2000,
      minify: false,
      ...options,
    };
    function getValues(): T[] {
      if (!opts.filename) {
        throw new Error("CrudityOptions.filename is not set.");
      }
      if (fs.existsSync(opts.filename)) {
        const result = JSON.parse(
          fs.readFileSync(opts.filename, {
            encoding: "utf8",
          })
        );
        return result;
      }
      fs.writeFileSync(opts.filename, "[]");
      return [];
    }

    const values: T[] = getValues();
    this.nextId = Math.max(-1, ...values.map((t) => +t.id)) + 1;
    this.array$.next(values);
    this.map = values.reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {} as { [key: string]: T });

    const stringify = (o: T[]) =>
      opts.minify ? JSON.stringify(o) : JSON.stringify(o, undefined, 2);

    this.array$
      .pipe(
        skip(1), // first marble is skipped because it is read from the file.
        distinct(),
        debounceTime(opts.debounceTimeDelay),
        switchMap((array) =>
          from(fs.promises.writeFile(opts.filename, stringify(array)))
        )
      )
      .subscribe((array) => {
        // console.log("array written");
      });
  }

  add(t: T): T {
    const id = this.nextId + "";
    const newT = { ...t, id };
    this.map[id] = newT;
    this.nextId++;
    this.array$.next(Object.values(this.map));
    return newT;
  }

  rewrite(t: T): T {
    if (!t.id) {
      throw new Error("no id");
    }
    this.map[t.id] = t;
    this.array$.next(Object.values(this.map));
    return t;
  }

  patch(id: string, body: any): T {
    this.map[id] = { ...this.map[id], ...body };
    this.array$.next(Object.values(this.map));
    return this.map[id];
  }

  remove(ids: string[]): void {
    for (const id of ids) {
      delete this.map[id];
    }
    this.array$.next(Object.values(this.map));
  }

  removeAll(): void {
    this.map = {};
    this.array$.next([]);
  }

  get(query: CrudityQueryString, defaultPageSize = 20): Partial<T>[] {
    // filter
    const filteredArray = filter<T>(this.array$.value, query.filter);

    // order by
    const array = orderBy<T>(filteredArray, query.orderBy);

    // pagination
    const pageSize =
      !query.pageSize || isNaN(+query.pageSize)
        ? defaultPageSize
        : +query.pageSize;
    const page = !query.page || isNaN(+query.page) ? 1 : +query.page;
    const { start, end } = getPageSlice(pageSize, page);
    const pagedArray = array.slice(start, end);

    // select
    const selectArray = select<T>(pagedArray, query.select);

    // unselect
    const unselectArray = unselect<T>(selectArray, query.unselect);

    return unselectArray;
  }

  getOne(id: string): T {
    return this.map[id];
  }
}
