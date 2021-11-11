import express, {Response, Router} from 'express';
import {Server} from 'http';
import {CRUDServiceFactory} from './CRUDService/CRUDServiceFactory';
import {CrudityOptions} from './interfaces/CrudityOptions';
import {CrudityQueryString} from './interfaces/CrudityQueryString';
import {Idable} from './interfaces/Idable';
import {checkQueryString} from './querystring';

const defaultOptions: CrudityOptions = {
  pageSize: 15,
  storage: {
    type: 'file',
    dataDir: './data',
  },
};

const manageError = (err: unknown, res: Response) => {
  console.error('err: ', err);
  res.status(500).end();
};

export const crudity = <T extends Idable>(
  server: Server,
  resourceName: string,
  opts: Partial<CrudityOptions> = {}
) => {
  const options = {...defaultOptions, ...opts};
  console.log('options: ', options);

  const crudService = CRUDServiceFactory.get<T>(resourceName, options.storage);

  (async () => {
    try {
      console.log(
        `about to start crudity service for resource ${resourceName}(${options.storage.type})`
      );
      await crudService.init();
      console.log(
        `crudity service for resource ${resourceName}(${options.storage.type}) started with success.`
      );
    } catch (err) {
      console.log('err: ', err);
      throw err;
    }
  })();

  server.on('close', async () => {
    console.log(
      `about to stop crudity service for resource ${resourceName}(${options.storage.type})`
    );
    await crudService.finalize();
    console.log(
      `crudity service for resource ${resourceName}(${options.storage.type}) stopped with success.`
    );
  });

  const app = Router();

  app.use((req, res, next) => {
    // already started
    if (crudService.isStarted) {
      next();
    }
    // not yet started, wait...
    crudService.once('started', () => {
      next();
    });
  });

  app.use((req, res, next) => {
    console.log('crudity req.url', req.url);
    next();
  });

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
          res.status(201).json(array);
          return;
        }
        const t: T = req.body;
        const newT = await crudService.add(t);
        res.status(201).json(newT);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.get('/', (req, res) => {
    console.log('app.get');
    (async () => {
      try {
        const query = req.query as unknown as CrudityQueryString;
        try {
          checkQueryString(query);
        } catch (e) {
          res.status(400).end('queryString not well formatted: ' + e);
          return;
        }
        console.log('about to call get');
        const array = await crudService.get(query, options.pageSize);
        console.log('array: ', array);
        res.json(array);
        return;
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.get('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = crudService.getOne(id);
        if (!t) {
          res.status(404).end();
          return;
        }
        res.json(t);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.put('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = crudService.getOne(id);
        if (!t) {
          res.status(404).end();
          return;
        }
        req.body.id = id;
        const newT = crudService.rewrite(req.body as T);
        res.json(newT);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.patch('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = crudService.getOne(id);
        if (!t) {
          res.status(404).end();
          return;
        }
        const newT = crudService.patch(id, req.body);
        res.json(newT);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.delete('/', (req, res) => {
    (async () => {
      try {
        if (!(req.body instanceof Array)) {
          crudService.removeAll();
          res.status(204).end();
          return;
        }
        const ids: string[] = req.body;
        crudService.remove(ids);
        res.status(204).end();
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.delete('/:id', (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        crudService.remove([id]);
        res.status(204).end();
        return;
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.use((req, res) => {
    res.status(405).end();
  });

  return app;
};
