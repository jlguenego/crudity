import {CrudityRouter} from './../interfaces/CrudityRouter';
import {NextFunction, Request, Response} from 'express';
import {Idable} from '../interfaces/Idable';

export const checkDuplicate =
  <T extends Idable>(crud: CrudityRouter<T>, uniqueFieldName: keyof T) =>
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const resource = req.body;
        const result = await crud.service.get({
          filter: {[uniqueFieldName]: resource[uniqueFieldName]},
        });
        if (result.array.length > 0) {
          res.status(400).send(`duplicate name : ${resource.name}`);
          return;
        }
        next();
      } catch (err) {
        res.status(500).end();
      }
    })();
  };
