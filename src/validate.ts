import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";

export function validate<T>(dtoClass: new () => T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const output: T = plainToClass<T, any>(dtoClass, req.body);
    console.log('output: ', output);
    next();
  };
}
