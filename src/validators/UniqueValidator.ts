import {Idable} from '../interfaces/Idable';
import {Validator, ValidatorError} from './Validator';

export class UniqueValidator<T extends Idable> extends Validator<T> {
  async validate(resource: T, args: string[]): Promise<void> {
    for (const uniqueFieldName of args as (keyof T)[]) {
      const result = await this.service.get({
        filter: {
          [uniqueFieldName]: resource[uniqueFieldName] as unknown as string,
        },
      });
      if (result.array.length > 0) {
        throw new ValidatorError(
          `duplicate name : ${resource[uniqueFieldName]}`
        );
      }
    }
  }
}
