import {PaginatedResult} from './../../interfaces/PaginatedResult';
import fs from 'fs';
import {dirname} from 'path';
import {BehaviorSubject, firstValueFrom, Subject} from 'rxjs';
import {debounceTime, filter, tap} from 'rxjs/operators';
import {FileStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {CRUDService} from '../CRUDService';
import {getPageSlice, orderBy, queryFilter, select, unselect} from './misc';

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

  async add(item: T): Promise<T> {
    const newItem = {...item};
    newItem.id = this.generateId();
    this.array.push(newItem);
    this.writeFile$.next();
    return item;
  }

  async addMany(newItems: T[]): Promise<T[]> {
    const result: T[] = [];
    for (const item of newItems) {
      result.push(await this.add(item));
    }
    return result;
  }

  generateId() {
    return Date.now() + '_' + Math.floor(Math.random() * 1e6);
  }

  async get(
    query: CrudityQueryString,
    defaultPageSize: number
  ): Promise<PaginatedResult<T>> {
    // filter
    const filteredArray = queryFilter<T>(this.array, query.filter);

    // order by
    const array = orderBy<T>(filteredArray, query.orderBy);

    // pagination
    const pageSize =
      !query.pageSize || isNaN(+query.pageSize)
        ? defaultPageSize
        : +query.pageSize;
    const page = !query.page || isNaN(+query.page) ? 1 : +query.page;
    const {start, end} = getPageSlice(pageSize, page);
    const pagedArray = array.slice(start, end);

    // select
    const selectArray = select<T>(pagedArray, query.select);

    // unselect
    const unselectArray = unselect<T>(selectArray, query.unselect);

    return {
      array: unselectArray,
      length: array.length,
      page,
      pageSize,
    };
  }

  async getOne(id: string): Promise<T | undefined> {
    return this.array.find(r => r.id === id);
  }

  async patch(id: string, body: Partial<T>): Promise<T> {
    const resource = this.array.find(r => r.id === id);
    if (!resource) {
      throw new Error('not found');
    }
    Object.assign(resource, body);
    this.writeFile$.next();
    return resource;
  }

  async remove(ids: string[]): Promise<void> {
    this.array = this.array.filter(r => !ids.includes(r.id));
    this.writeFile$.next();
  }

  async removeAll(): Promise<void> {
    this.array = [];
    this.writeFile$.next();
  }

  async rewrite(t: T): Promise<T> {
    if (!t.id) {
      throw new Error('not id provided');
    }
    const index = this.array.findIndex(r => r.id === t.id);
    if (!index) {
      throw new Error('not found');
    }
    this.array[index] = t;
    this.writeFile$.next();
    return t;
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
  }

  async stop(): Promise<void> {
    // wait for status === NO_ORDER
    await firstValueFrom(
      this.writeFileStatus$.pipe(filter(status => status === Status.NO_ORDER))
    );
    console.log('file closed');
  }
}
