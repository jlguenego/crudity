import {CRUDService} from '../CRUDService/CRUDService';
import {Idable} from '../interfaces/Idable';

export abstract class Validator<T extends Idable> {
  constructor(protected service: CRUDService<T>) {}

  abstract validate(resource: T, args: string[]): Promise<void>;
}

export class ValidatorError extends Error {}
