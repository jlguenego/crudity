import { BehaviorSubject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { CrudityOptions } from "./interfaces";
import { promises as fs } from "fs";
import path from "path";

export class Resource<T extends { id?: string }> {
  array$ = new BehaviorSubject<T[]>([]);
  map: { [key: string]: T } = {};
  private nextId = 0;
  constructor(options: CrudityOptions) {
    const opts = {
      filename: path.resolve(__dirname, "data.json"),
    };
    Object.assign(opts, options);
    (async () => {
      const values: T[] = JSON.parse(
        await fs.readFile(opts.filename, {
          encoding: "utf8",
        })
      );
      this.map = values.reduce((acc, n) => {
        acc[n.id] = n;
        return acc;
      }, {});
    })();

    this.array$.pipe(debounceTime(2000)).subscribe((array) => {
      const str = JSON.stringify(array, undefined, 2);
      fs.writeFile(opts.filename, str);
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

  remove(ids: string[]) {
    for (const id of ids) {
      delete this.map[id];
    }
    this.array$.next(Object.values(this.map));
  }
}
