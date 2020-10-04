import { Request, Response, NextFunction } from "express";

export class Validator<T> {
  post(req: Request, res: Response, next: NextFunction): void {
    next();
  }
}
