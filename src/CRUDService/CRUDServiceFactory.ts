import {StorageOptions} from '../interfaces/CrudityOptions';
import {Idable} from '../interfaces/Idable';
import {CRUDService} from './CRUDService';
import {FileCRUDService} from './file/FileCRUDService';
import {MongoDBCRUDService} from './mongodb/MongoDBCRUDService';

interface CRUDServiceInjector {
  [type: string]: new (
    resourceName: string,
    options: StorageOptions
  ) => CRUDService<Idable>;
}

export class CRUDServiceFactory {
  static injector: CRUDServiceInjector = {
    file: FileCRUDService as new (
      resourceName: string,
      options: StorageOptions
    ) => CRUDService<Idable>,
    mongodb: MongoDBCRUDService as new (
      resourceName: string,
      options: StorageOptions
    ) => CRUDService<Idable>,
  };
  static get<T extends Idable>(
    resourceName: string,
    options: StorageOptions
  ): CRUDService<T> {
    const className = CRUDServiceFactory.injector[options.type];
    return new className(resourceName, options) as CRUDService<T>;
  }
}
