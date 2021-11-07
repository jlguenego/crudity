import fs from 'fs';
import {dirname} from 'path';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {FileStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {CRUDService} from '../CRUDService';

export class FileCRUDService<T extends Idable> extends CRUDService<T> {
  array: T[] = [];
  dbFilename = `${this.options.dataDir}/${this.resourceName}.json`;
  writeFile$ = new Subject<void>();

  constructor(resourceName: string, public options: FileStorageOptions) {
    super(resourceName);
    this.writeFile$.pipe(debounceTime(2000)).subscribe(async () => {
      await fs.promises.writeFile(
        this.dbFilename,
        JSON.stringify(this.array, null, 2)
      );
    });
  }

  generateId() {
    return Date.now() + '_' + Math.floor(Math.random() * 1e6);
  }

  async add(item: T): Promise<T> {
    const newItem = {...item};
    newItem.id = this.generateId();
    this.array.push(newItem);
    this.writeFile$.next();
    return item;
  }

  async get(query: CrudityQueryString, pageSize: number): Promise<T[]> {
    return this.array;
  }

  async getOne(id: string): Promise<T | undefined> {
    return this.array.find(r => r.id === id);
  }

  patch(id: string, body: Partial<T>): Promise<T> {
    throw new Error('not implemented.');
  }

  remove(ids: string[]): Promise<void> {
    throw new Error('not implemented.');
  }

  removeAll(): Promise<void> {
    throw new Error('not implemented.');
  }

  rewrite(arg0: T): Promise<T> {
    throw new Error('not implemented.');
  }

  async start(): Promise<void> {
    // do your stuff before super.start()

    try {
      await fs.promises.mkdir(dirname(this.dbFilename), {recursive: true});
      await fs.promises.access(
        this.dbFilename,
        fs.constants.W_OK | fs.constants.R_OK
      );
    } catch (err) {
      await fs.promises.writeFile(this.dbFilename, '[]');
    }

    const str = await fs.promises.readFile(this.dbFilename, {
      encoding: 'utf-8',
    });
    console.log('str: ', str);
    this.array = JSON.parse(str);
    console.log('this.array: ', this.array);
    await super.start();
  }

  async stop(): Promise<void> {
    // do your stuff before super.stop()
    await super.stop();
  }
}
