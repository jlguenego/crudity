import { BehaviorSubject } from "rxjs";

export class Resource<T extends { id?: string }> {
  array$ = new BehaviorSubject<T[]>([]);
  // map: { [key: string]: T } = {};
  private nextId = 0;
  constructor() {}

  add(t: T): T {
    const newT = { ...t, id: this.nextId + "" };
    this.nextId++;
    this.array$.next([...this.array$.value, newT]);
    return newT;
  }

  remove(ids: string[]) {
    console.log("oladArray", this.array$.value);
    const newArray = this.array$.value.filter((t) => !ids.includes(t.id));
    console.log("newArray: ", newArray);
    this.array$.next(newArray);
  }
}
