import {Router} from 'express';
import path from 'path';
import {CrudityOptions} from './interfaces/CrudityOptions';

const options: CrudityOptions = {
  resources: ['tickets'],
  rootEndPoint: '/api',
};

export const crudity = (opts: Partial<CrudityOptions>) => {
  const crudityOpts = require(path.resolve(process.cwd(), './.crudity'));
  Object.assign(options, crudityOpts, opts);
  console.log('options: ', options);
  const app = Router();
  app.use(options.rootEndPoint, (req, res) => {
    res.json([123]);
  });
  return app;
};
