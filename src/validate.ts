import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

export function validateMiddleware<T>(dtoClass: new () => T) {
  return (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        if (req.body instanceof Array) {
          const output: T[] = plainToClass<T, Object[]>(dtoClass, req.body, {
            excludeExtraneousValues: true,
          });
          const validationErrors = await validate(output, {
            skipMissingProperties: true,
          });
          if (validationErrors.length > 0) {
            return res
              .status(400)
              .json(validationErrors.map((e) => e.constraints));
          }
          // delete empty keys
          output.forEach((o) => {
            for (const key of Object.keys(o)) {
              if (o[key] === undefined) {
                delete o[key];
              }
            }
          });
          req.body = output;
          return next();
        }
        if (req.body instanceof Object) {
          const output: T = plainToClass<T, any>(dtoClass, req.body, {
            excludeExtraneousValues: true,
          });
          const validationErrors = await validate(output, {
            skipMissingProperties: true,
          });
          if (validationErrors.length > 0) {
            return res
              .status(400)
              .json(validationErrors.map((e) => e.constraints));
          }
          // delete empty keys
          for (const key of Object.keys(output)) {
            if (output[key] === undefined) {
              delete output[key];
            }
          }
          req.body = output;
          return next();
        }
      } catch (e) {
        console.log("e: ", e);
        res.status(500).end();
      }
    })();
  };
}
