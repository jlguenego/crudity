import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

export function validateMiddleware<T>(dtoClass: new () => T) {
  return (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const output: T = plainToClass<T, any>(dtoClass, req.body);
        console.log("output: ", output);
        const validationErrors = await validate(output, {
            skipMissingProperties: true,
        });
        console.log('validationErrors: ', validationErrors);
        if (validationErrors.length > 0) {
          return res
            .status(400)
            .json(validationErrors.map((e) => e.constraints));
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
