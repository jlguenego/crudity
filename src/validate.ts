import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

export function validateMiddleware<T>(dtoClass: new () => T) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body instanceof Array) {
      return next();
    }
    (async () => {
      try {
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
        next();
      } catch (e) {
        console.log("e: ", e);
        res.status(500).end();
      }
    })();
  };
}
