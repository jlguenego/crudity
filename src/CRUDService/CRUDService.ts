import EventEmitter from 'events';
import {CrudityQueryString} from '../interfaces/CrudityQueryString';
import {Idable} from '../interfaces/Idable';
import {PaginatedResult} from '../interfaces/PaginatedResult';

export abstract class CRUDService<T extends Idable> extends EventEmitter {
  isStarted = false;

  constructor(protected resourceName: string) {
    super();
  }

  async finalize(): Promise<void> {
    await this.stop();
    this.isStarted = false;
    this.emit('stopped');
  }

  async init(): Promise<void> {
    await this.start();
    this.isStarted = true;
    this.emit('started');
  }

  abstract add(item: T): Promise<T>;
  abstract addMany(newItems: T[]): Promise<T[]>;
  abstract get(
    query: CrudityQueryString,
    defaultPageSize?: number
  ): Promise<PaginatedResult<T>>;
  abstract getOne(id: string): Promise<T | undefined>;
  abstract patch(id: string, body: Partial<T>): Promise<T>;
  abstract remove(ids: string[]): Promise<void>;
  abstract removeAll(): Promise<void>;
  abstract rewrite(arg0: T): Promise<T>;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}
