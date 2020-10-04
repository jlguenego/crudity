import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

import { TypeClass } from "../src/interface";
import { Validator } from "../src/Validator";

function removeEmptyKeys(o: { [key: string]: any }) {
  for (const key of Object.keys(o)) {
    if (o[key] === undefined) {
      delete o[key];
    }
  }
}

export class DTOValidator<T> extends Validator<T> {
  constructor(private type: TypeClass<T>) {
    super();
  }

  post(req: Request, res: Response, next: NextFunction): void {
    (async () => {
      try {
        const output: T[] | T =
          req.body instanceof Array
            ? plainToClass<T, Object[]>(this.type, req.body, {
                excludeExtraneousValues: true,
              })
            : plainToClass<T, any>(this.type, req.body, {
                excludeExtraneousValues: true,
              });

        const validationErrors = await validate(output, {
          skipMissingProperties: true,
        });
        if (validationErrors.length > 0) {
          return res.status(400).json(validationErrors);
        }
        output instanceof Array
          ? output.forEach(removeEmptyKeys)
          : removeEmptyKeys(output);

        req.body = output;
        return next();
      } catch (e) {
        /* istanbul ignore next */
        next(e);
      }
    })();
  }
}
