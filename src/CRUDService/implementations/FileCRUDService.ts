import fs from 'fs';
import {dirname} from 'path';
import {BehaviorSubject, firstValueFrom, Subject} from 'rxjs';
import {debounceTime, filter, tap} from 'rxjs/operators';
import {FileStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {CRUDService} from '../CRUDService';

enum Status {
  NO_ORDER = 0,
  ORDER_TO_DO = 1,
  ORDER_WRITING = 2,
}

export class FileCRUDService<T extends Idable> extends CRUDService<T> {
  array: T[] = [];
  dbFilename = `${this.options.dataDir}/${this.resourceName}.json`;
  writeFile$ = new Subject<void>();
  writeFileStatus$ = new BehaviorSubject<Status>(Status.NO_ORDER);

  constructor(resourceName: string, public options: FileStorageOptions) {
    super(resourceName);
    this.writeFile$
      .pipe(
        tap(() => {
          this.writeFileStatus$.next(Status.ORDER_TO_DO);
        }),
        debounceTime(2000)
      )
      .subscribe(async () => {
        this.writeFileStatus$.next(Status.ORDER_WRITING);
        await fs.promises.writeFile(
          this.dbFilename,
          JSON.stringify(this.array, null, 2)
        );
        if (this.writeFileStatus$.value === Status.ORDER_WRITING) {
          this.writeFileStatus$.next(Status.NO_ORDER);
        }
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
    this.array = JSON.parse(str);
    await super.start();
  }

  async stop(): Promise<void> {
    // wait for status === NO_ORDER
    await firstValueFrom(
      this.writeFileStatus$.pipe(filter(status => status === Status.NO_ORDER))
    );
    await super.stop();
  }
}
