import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { CrudityOptions } from "./interface";

function removeEmptyKeys(o: { [key: string]: any }) {
  for (const key of Object.keys(o)) {
    if (o[key] === undefined) {
      delete o[key];
    }
  }
}

export function validateMiddleware<T>(options: CrudityOptions<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options.dtoClass === undefined) {
      return next();
    }
    const dtoClass = options.dtoClass;
    (async () => {
      try {
        const output: T[] | T =
          req.body instanceof Array
            ? plainToClass<T, Object[]>(dtoClass, req.body, {
                excludeExtraneousValues: true,
              })
            : plainToClass<T, any>(dtoClass, req.body, {
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
  };
}
