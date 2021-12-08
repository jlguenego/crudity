import {CRUDService} from '../CRUDService/CRUDService';
import {Idable} from '../interfaces/Idable';
import {UniqueValidator} from './UniqueValidator';

export class ValidatorFactory {
  static get<T extends Idable>(crud: CRUDService<T>, name: string) {
    if (name === 'unique') {
      return new UniqueValidator(crud);
    }
    throw new Error('unknown validator');
  }
}
