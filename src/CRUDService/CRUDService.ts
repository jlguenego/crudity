import EventEmitter from 'events';
import {CrudityQueryString} from '../interfaces/CrudityQueryString';
import {Idable} from '../interfaces/Idable';

export abstract class CRUDService<T extends Idable> extends EventEmitter {
  constructor(protected resourceName: string) {
    super();
  }
  isStarted = false;

  async init(): Promise<void> {
    await this.start();
    this.isStarted = true;
    this.emit('started');
  }

  async finalize(): Promise<void> {
    await this.stop();
    this.isStarted = false;
    this.emit('stopped');
  }

  abstract add(item: T): Promise<T>;
  abstract get(
    query: CrudityQueryString,
    pageSize: number
  ): Promise<Partial<T>[]>;
  abstract getOne(id: string): Promise<T | undefined>;
  abstract patch(id: string, body: Partial<T>): Promise<T>;
  abstract remove(ids: string[]): Promise<void>;
  abstract removeAll(): Promise<void>;
  abstract rewrite(arg0: T): Promise<T>;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}
