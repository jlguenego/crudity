import { BehaviorSubject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { CrudityOptions } from "./CrudityOpions";
import fs from "fs";
import path from "path";

export class Resource<T extends { id?: string }> {
  array$ = new BehaviorSubject<T[]>([]);
  map: { [key: string]: T } = {};

  private nextId = 1;

  constructor(options: CrudityOptions) {
    const opts = {
      filename: path.resolve(__dirname, "data.json"),
      debounceTimeDelay: 2000,
    };
    Object.assign(opts, options);

    function getValues(filename: string): T[] {
      try {
        return JSON.parse(
          fs.readFileSync(filename, {
            encoding: "utf8",
          })
        );
      } catch (e) {
        return [];
      }
    }

    const values: T[] = getValues(opts.filename);
    this.nextId = Math.max(0, ...values.map((t) => +t.id)) + 1;
    this.array$.next(values);
    this.map = values.reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {});

    this.array$
      .pipe(debounceTime(opts.debounceTimeDelay))
      .subscribe((array) => {
        const str = JSON.stringify(array, undefined, 2);
        fs.promises.writeFile(opts.filename, str);
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
