import { BehaviorSubject, from } from "rxjs";
import { debounceTime, switchMap, distinct, skip } from "rxjs/operators";
import { CrudityOptions } from "./CrudityOptions";
import fs from "fs";

export class Resource<T extends { id?: string }> {
  array$ = new BehaviorSubject<T[]>([]);
  map: { [key: string]: T } = {};

  private nextId = 1;

  constructor(opts: CrudityOptions<T>) {
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
    }, {});

    const stringify = (o) =>
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

  patch(id: string, body: any) {
    this.map[id] = { ...this.map[id], ...body };
    this.array$.next(Object.values(this.map));
    return this.map[id];
  }

  remove(ids: string[]) {
    for (const id of ids) {
      delete this.map[id];
    }
    this.array$.next(Object.values(this.map));
  }

  removeAll() {
    this.map = {};
    this.array$.next([]);
  }
}
