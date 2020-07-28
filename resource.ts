export class Resource<T extends { id?: string }> {
  array: T[] = [];
  // map: { [key: string]: T } = {};
  private nextId = 0;
  constructor() {}

  add(t: T): T {
    const newT = { ...t, id: this.nextId + "" };
    this.array.push(newT);
    return newT;
  }

  remove(ids: string[]) {
    this.array = this.array.filter((t) => !ids.includes(t.id));
  }
}
