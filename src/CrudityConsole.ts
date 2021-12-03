export class CrudityConsole {
  constructor(private enableLog: boolean) {}
  log(...args: unknown[]) {
    if (this.enableLog) {
      console.log(...args);
    }
  }
}
