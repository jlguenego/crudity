import express, {Router} from 'express';
import path from 'path';
import {CRUDServiceFactory} from './CRUDService/CRUDServiceFactory';
import {CrudityOptions} from './interfaces/CrudityOptions';
import {CrudityQueryString} from './interfaces/CrudityQueryString';
import {Idable} from './interfaces/Idable';
import {checkQueryString} from './querystring';

const options: CrudityOptions = {
  pageSize: 15,
  storage: {
    type: 'file',
    dataDir: './dataDir',
  },
};

export const crudity = <T extends Idable>(
  opts: Partial<CrudityOptions> = {}
) => {
  const crudityOpts = require(path.resolve(process.cwd(), './.crudity'));
  Object.assign(options, crudityOpts, opts);

  const crudService = CRUDServiceFactory.get<T>(options.storage);

  const app = Router();

  app.use(express.json());

  app.post('/', (req, res) => {
    (async () => {
      try {
        if (req.body instanceof Array) {
          // bulk scenario
          const array: T[] = [];
          for (const item of req.body as T[]) {
            array.push(await crudService.add(item));
          }
          return res.status(201).json(array);
        }
        const t: T = req.body;
        const newT = crudService.add(t);
        return res.status(201).json(newT);
      } catch (err) {
        res.status(500).end();
        return;
      }
    })();
  });

  app.get('/', (req, res) => {
    (async () => {
      try {
        const query = req.query as unknown as CrudityQueryString;
        try {
          checkQueryString(query);
        } catch (e) {
          return res.status(400).end('queryString not well formatted: ' + e);
        }
        const array = crudService.get(query, options.pageSize);
        return res.json(array);
      } catch (err) {
        res.status(500).end();
      }
    })();
  });

  app.get('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = crudService.getOne(id);
        if (!t) {
          return res.status(404).end();
        }
        return res.json(t);
      } catch (err) {
        res.status(500).end();
      }
    })();
  });

  app.put('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = crudService.getOne(id);
        if (!t) {
          return res.status(404).end();
        }
        req.body.id = id;
        const newT = crudService.rewrite(req.body as T);
        return res.json(newT);
      } catch (err) {
        res.status(500).end();
      }
    })();
  });

  app.patch('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = crudService.getOne(id);
        if (!t) {
          return res.status(404).end();
        }
        const newT = crudService.patch(id, req.body);
        return res.json(newT);
      } catch (err) {
        res.status(500).end();
      }
    })();
  });

  app.delete('/', (req, res) => {
    (async () => {
      try {
        if (!(req.body instanceof Array)) {
          crudService.removeAll();
          return res.status(204).end();
        }
        const ids: string[] = req.body;
        crudService.remove(ids);
        return res.status(204).end();
      } catch (err) {
        res.status(500).end();
      }
    })();
  });

  app.delete('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        crudService.remove([id]);
        return res.status(204).end();
      } catch (err) {
        res.status(500).end();
      }
    })();
  });

  return app;
};
