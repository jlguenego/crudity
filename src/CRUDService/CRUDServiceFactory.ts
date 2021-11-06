import {Idable} from '../interfaces/Idable';
import {StorageOptions} from './../interfaces/StorageOptions';
import {CRUDService} from './CRUDService';
import {FileCRUDService} from './implementations/FileCRUDService';
import {MongoDBCRUDService} from './implementations/MongoDBCRUDService';

interface CRUDServiceInjector {
  [type: string]: new (options: StorageOptions) => CRUDService<Idable>;
}

export class CRUDServiceFactory {
  static injector: CRUDServiceInjector = {
    file: FileCRUDService,
    mongodb: MongoDBCRUDService,
  };
  static get<T extends Idable>(options: StorageOptions): CRUDService<T> {
    const className = CRUDServiceFactory.injector[options.type];
    return new className(options) as CRUDService<T>;
  }
}
